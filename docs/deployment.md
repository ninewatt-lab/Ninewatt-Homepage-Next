# AWS EC2 배포 가이드

GitHub Actions를 사용하여 AWS EC2 인스턴스에 자동 배포하는 방식을 정리한 문서입니다.

## 배포 아키텍처

```
사용자 → Cloudflare (CDN/SSL/DDoS) → Nginx (443 SSL) → Docker (Next.js :3000)

GitHub (main push)
  → GitHub Actions
    → Docker 이미지 빌드
    → Amazon ECR에 push
    → EC2에 SSH 접속하여 컨테이너 교체
```

## 인프라 구성 요약

| 구성 요소 | 서비스 | 비고 |
|-----------|--------|------|
| 도메인 | Cafe24 (ninewatt.com) | 네임서버만 Cloudflare로 위임 |
| DNS / CDN / SSL | Cloudflare (무료 플랜) | 프록시 모드(🟠) 활성화 |
| 서버 | AWS EC2 (Amazon Linux 2023) | t3.small, ap-northeast-2 |
| 컨테이너 레지스트리 | AWS ECR | ninewatt-homepage |
| 리버스 프록시 | Nginx | SSL 종료 + 프록시 |
| 앱 서버 | Docker (Next.js standalone) | 포트 3000 |

## 관련 파일

| 파일 | 역할 |
|------|------|
| `Dockerfile` | Next.js standalone 멀티스테이지 빌드 |
| `.dockerignore` | Docker 빌드 시 제외할 파일 목록 |
| `.github/workflows/deploy.yml` | GitHub Actions 배포 워크플로우 |
| `next.config.ts` | `output: "standalone"` 설정 (Docker 배포에 필요) |

## 배포 흐름

1. `main` 브랜치에 push
2. GitHub Actions가 자동 트리거
3. Docker 이미지 빌드 (멀티스테이지: deps → build → production)
4. Amazon ECR (`ninewatt-homepage`)에 이미지 push
5. EC2에 SSH 접속 → 기존 컨테이너 중지/삭제 → 새 이미지 pull & run

## AWS 사전 설정

### 1. ECR 리포지토리

- 리포지토리 이름: `ninewatt-homepage`
- 리전: `ap-northeast-2` (서울)
- 가시성: Private
- Tag Mutability: Mutable

### 2. IAM 사용자 (GitHub Actions용)

- 사용자 이름: `github-actions-deploy`
- 연결 정책: `AmazonEC2ContainerRegistryPowerUser`
- Access Key 생성 후 GitHub Secrets에 등록

### 3. EC2 인스턴스

- AMI: Amazon Linux 2023 (또는 Ubuntu 24.04)
- 인스턴스 유형: t3.small 이상 (2GB RAM 권장)
- 스토리지: 20GB 이상
- 보안 그룹 인바운드 규칙:
  - SSH (22): 내 IP
  - TCP (3000): 0.0.0.0/0
  - (선택) HTTP (80): 0.0.0.0/0

### 4. EC2 초기 설정

```bash
# Docker 설치 (Amazon Linux 2023)
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# 재접속 후 확인
docker --version
```

### 5. EC2 IAM Role (ECR 접근용)

- 역할 이름: `ec2-ecr-readonly`
- 연결 정책: `AmazonEC2ContainerRegistryReadOnly`
- EC2 인스턴스에 해당 역할 연결: EC2 콘솔 → 인스턴스 → 작업 → 보안 → IAM 역할 수정

## GitHub Repository Secrets

GitHub 저장소 → Settings → Secrets and variables → Actions에 아래 값을 등록합니다.

| Secret 이름 | 설명 |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM 사용자 Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM 사용자 Secret Access Key |
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_USERNAME` | SSH 사용자 (`ec2-user` 또는 `ubuntu`) |
| `EC2_SSH_KEY` | EC2 키페어 `.pem` 파일 전체 내용 |

## Dockerfile 구조

멀티스테이지 빌드로 최종 이미지 크기를 최소화합니다.

| Stage | 역할 |
|-------|------|
| `base` | Node.js 22 Alpine + pnpm 설치 |
| `deps` | `pnpm install --frozen-lockfile`으로 의존성 설치 |
| `builder` | `pnpm build`로 Next.js 빌드 |
| `runner` | standalone 출력물만 복사하여 실행 (포트 3000) |

## Cloudflare 설정

### 1. 도메인 등록

1. https://dash.cloudflare.com → 사이트 추가 → `ninewatt.com`
2. 무료 플랜 선택

### 2. DNS 레코드

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `43.201.33.239` (EC2 IP) | 🟠 Proxied |
| CNAME | `www` | `ninewatt.com` | 🟠 Proxied |
| CNAME | `*` | `ninewatt.com` | 🟠 Proxied |
| A | `mail` | `211.118.82.74` | 🟠 Proxied |
| MX | `ninewatt.com` | `ninewatt-com.mail.protection.outlook.com` (우선순위 1) | DNS only |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DNS only |
| TXT | `ninewatt.com` | `v=spf1 include:spf.protection.outlook.com -all` | DNS only |

> **참고**: Elastic IP를 사용하지 않으므로, EC2 인스턴스를 stop/start하면 IP가 변경됩니다.
> IP 변경 시 Cloudflare DNS A 레코드를 수동으로 업데이트해야 합니다.

### 3. Cafe24 네임서버 변경

Cafe24 도메인 관리에서 네임서버를 Cloudflare로 변경:

- `alexis.ns.cloudflare.com` (IP: `172.64.33.60`)
- `mira.ns.cloudflare.com` (IP: `172.64.32.204`)

기존 Cafe24 네임서버(`ns1.cafe24dns.co.kr`, `ns3.cafe24dns.co.kr`)는 삭제합니다.

### 4. SSL/TLS 설정

- SSL/TLS → Overview → **Full (Strict)** 모드 선택
- Origin Server → **Origin Certificate** 발급 (유효기간 15년)

## Nginx 설정 (SSL + 리버스 프록시)

### Nginx 설치

```bash
sudo yum install -y nginx
sudo systemctl enable nginx
```

### Cloudflare Origin Certificate 설치

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/cert.pem   # Origin Certificate 붙여넣기
sudo nano /etc/ssl/cloudflare/key.pem    # Private Key 붙여넣기
sudo chmod 600 /etc/ssl/cloudflare/key.pem
```

### Nginx 설정 파일

`/etc/nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name ninewatt.com www.ninewatt.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ninewatt.com www.ninewatt.com;

    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

> **참고**: 기존 `/etc/nginx/conf.d/ninewatt.conf` 파일이 있으면 삭제하여 충돌을 방지합니다.

```bash
sudo rm -f /etc/nginx/conf.d/ninewatt.conf
sudo nginx -t
sudo systemctl restart nginx
```

## 트러블슈팅

### Cloudflare 521 에러 (Web server is down)

- Cloudflare가 Origin 서버에 연결하지 못할 때 발생
- **원인**: Cloudflare SSL 모드가 Full인데 Nginx에 SSL 설정이 없는 경우
- **해결**: Nginx에 Origin Certificate를 설치하거나, 임시로 SSL 모드를 Flexible로 변경

### EC2 IP 변경 시

1. AWS 콘솔에서 새 퍼블릭 IP 확인
2. Cloudflare DNS → A 레코드 (`ninewatt.com`) IP 업데이트
3. GitHub Secrets → `EC2_HOST` 값 업데이트

### DNS 전파 확인

```bash
# Cloudflare를 통한 IP 확인 (프록시 활성화 시 Cloudflare IP가 보임)
dig ninewatt.com @8.8.8.8 +short

# 네임서버 확인
dig ninewatt.com NS @8.8.8.8 +short
```
