# AWS EC2 배포 가이드

GitHub Actions를 사용하여 AWS EC2 인스턴스에 자동 배포하는 방식을 정리한 문서입니다.

## 배포 아키텍처

```
GitHub (main push)
  → GitHub Actions
    → Docker 이미지 빌드
    → Amazon ECR에 push
    → EC2에 SSH 접속하여 컨테이너 교체
```

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

## (선택) Nginx 리버스 프록시

80포트로 접속하려면 EC2에 Nginx를 설치하고 리버스 프록시를 설정합니다.

```bash
sudo yum install -y nginx
sudo systemctl enable nginx
```

`/etc/nginx/conf.d/ninewatt.conf`:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl start nginx
```
