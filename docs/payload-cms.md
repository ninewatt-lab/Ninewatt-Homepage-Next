# Payload CMS 사용 가이드

Ninewatt 홈페이지는 Payload CMS 3.x를 사용하여 콘텐츠를 관리합니다.

---

## 1. 초기 설정 (로컬 개발)

### 1-1. PostgreSQL 실행

**Docker Compose (권장)**

```bash
docker compose up db -d
```

> **주의**: 로컬에 Homebrew PostgreSQL이 설치되어 있으면 포트 5432가 충돌할 수 있습니다.
> `brew services stop postgresql@14` 등으로 로컬 PG를 중지한 후 Docker를 사용하세요.

**또는 로컬 PostgreSQL**

```bash
# PostgreSQL 설치 후 DB 생성
createdb ninewatt
```

### 1-2. 환경 변수 설정

`.env` 파일이 프로젝트 루트에 있어야 합니다:

```
DATABASE_URL=postgresql://ninewatt:ninewatt@localhost:5432/ninewatt
PAYLOAD_SECRET=ninewatt-payload-secret-key-change-in-production-min-32-chars
```

> **프로덕션 배포 시** `PAYLOAD_SECRET`을 반드시 변경하세요 (32자 이상).

### 1-3. 데이터 시딩 (최초 1회)

기존 하드코딩된 데이터를 DB에 넣습니다:

```bash
pnpm seed
```

이 스크립트는 다음 데이터를 생성합니다:
- Admin 계정 (`admin@ninewatt.com` / `changeme123!`)
- 수상 내역 29건
- 인증 30건
- 연혁 34건
- 국내 특허 23건 + 해외 특허 10건
- R&D 과제 13건
- 회사 정보, 홈 통계, 경영진, 조직, 채용, 글로벌 사업 데이터

### 1-4. 개발 서버 실행

```bash
pnpm dev
```

- 홈페이지: http://localhost:3000
- **Admin UI**: http://localhost:3000/admin

---

## 2. Admin UI 사용법

### 2-1. 로그인

1. http://localhost:3000/admin 접속
2. 이메일: `admin@ninewatt.com`
3. 비밀번호: `changeme123!` (최초 로그인 후 변경 권장)

### 2-2. 콘텐츠 관리 구조

Admin UI 왼쪽 사이드바에서 다음 항목들을 관리할 수 있습니다:

#### Collections (반복 데이터)

| 메뉴 | 설명 | 예시 |
|------|------|------|
| **Awards** | 수상 내역 | 수상명, 주관기관, 등급, 연도 |
| **Certifications** | 인증 현황 | 인증명, 발급기관 |
| **History** | 회사 연혁 | 날짜, 내용, 연도 |
| **Patents** | 특허 (국내/국제) | 상태, 번호, 제목 |
| **Partners** | 파트너사 | 이름, 로고, 카테고리 |
| **R&D Projects** | R&D 과제 | 과제명, 기관, 상태, 상세 |
| **Media** | 이미지/파일 | 로고, PDF 등 업로드 |
| **Users** | 관리자 계정 | 이메일, 역할 |

#### Globals (싱글톤 데이터)

| 메뉴 | 설명 | 관리 항목 |
|------|------|----------|
| **회사 정보** | CompanyInfo | 회사명, 주소, 전화, 이메일, SNS 링크 |
| **홈 통계** | HomeStats | 설립, 직원수, 프로젝트 등 6개 지표 |
| **경영진** | Executives | CEO/CTO 프로필, 경력 |
| **조직 구조** | Organization | 부서명, 설명 |
| **채용 정보** | Career | 문화, 인재상, 복리후생, 채용 프로세스 |
| **글로벌 사업** | GlobalBusiness | 국가별 사업 항목 |

### 2-3. 데이터 수정 예시

#### 통계 수치 변경 (예: 직원수 30+ → 35+)

1. Admin UI → 좌측 메뉴 **홈 통계** 클릭
2. `stats` 배열에서 "직원 수" 항목 찾기
3. `값` 필드를 `30+` → `35+`로 변경
4. **Save** 클릭

#### 수상 내역 추가

1. Admin UI → 좌측 메뉴 **Awards** 클릭
2. 우측 상단 **Create New** 클릭
3. 수상명, 주관기관, 등급, 날짜, 연도 입력
4. **Save** 클릭

#### 연혁 추가

1. Admin UI → **History** → **Create New**
2. 날짜 (예: `2026.03`), 내용, 연도 입력
3. **Save**

---

## 3. 다국어 콘텐츠 관리

Payload CMS에서 다국어가 필요한 필드는 `localized` 표시가 있습니다.

### 언어 전환

1. Admin UI 상단에서 현재 locale 확인 (기본: 한국어)
2. locale 드롭다운에서 `English`, `日本語`, `Français` 선택
3. 해당 언어로 콘텐츠 입력
4. **Save**

### i18n 범위

| 관리 주체 | 대상 | 위치 |
|-----------|------|------|
| **CMS (Admin UI)** | 자주 바뀌는 데이터 | DB |
| **JSON 파일** | UI 라벨, 버튼 텍스트 | `src/messages/*/` |

> UI 라벨 ("문의하기", "자세히 보기" 등)은 여전히 `src/messages/` JSON 파일에서 관리합니다. 이 부분은 개발자가 수정합니다.

---

## 4. 사용자 권한

| 역할 | 콘텐츠 편집 | 계정 생성/삭제 |
|------|:-----------:|:-------------:|
| **Admin** | O | O |
| **Editor** | O | X |

- Admin 계정으로 로그인 후 **Users** → **Create New**에서 Editor 계정 생성 가능

---

## 5. 프로젝트 구조

```
payload.config.ts              ← CMS 전체 설정
patches/
└── payload@3.79.1.patch       ← Next.js 16 호환 패치 (@next/env)
src/
├── collections/               ← Collection 스키마 정의
│   ├── Users.ts
│   ├── Media.ts
│   ├── Awards.ts
│   ├── Certifications.ts
│   ├── History.ts
│   ├── Patents.ts
│   ├── Partners.ts
│   └── RndProjects.ts
├── globals/                   ← Global 스키마 정의
│   ├── CompanyInfo.ts
│   ├── HomeStats.ts
│   ├── Executives.ts
│   ├── Organization.ts
│   ├── Career.ts
│   └── GlobalBusiness.ts
├── lib/
│   ├── payload.ts             ← Payload 클라이언트
│   └── cms.ts                 ← 데이터 조회 래퍼 함수
├── seed/
│   └── index.ts               ← 초기 데이터 시딩
└── app/
    ├── layout.tsx             ← 루트 레이아웃 (children만 반환)
    ├── [locale]/
    │   └── layout.tsx         ← 프론트엔드 레이아웃 (<html>, Header, Footer)
    └── (payload)/             ← Admin UI 라우트 (별도 <html>)
        ├── layout.tsx         ← Payload RootLayout 사용
        ├── admin/
        │   ├── importMap.js   ← 자동 생성, git 추적 대상
        │   └── [[...segments]]/
        └── api/[...slug]/
```

> **레이아웃 구조 참고**: 루트 `layout.tsx`는 `<html>`/`<body>` 없이 `children`만 반환합니다.
> `[locale]/layout.tsx`와 `(payload)/layout.tsx`가 각각 독립적으로 `<html>`/`<body>`를 관리하여
> 프론트엔드와 Admin UI의 충돌을 방지합니다.

---

## 6. 배포

### 6-1. 배포 아키텍처

```
GitHub (main push)
  → GitHub Actions
    → Docker Build (임시 PostgreSQL로 빌드)
    → ECR Push
    → EC2 SSH 배포
      → ninewatt-db (PostgreSQL 16, Docker)
      → ninewatt-homepage (Next.js + Payload, Docker)
      → ninewatt-net (Docker 네트워크)
```

### 6-2. GitHub Actions (자동 배포)

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`에 의해 자동 배포됩니다.

**배포 흐름:**
1. GitHub Actions에서 임시 PostgreSQL 서비스 컨테이너 실행 (빌드용)
2. `--network=host`로 Docker 이미지 빌드 (Payload가 빌드 시 DB 접속 필요)
3. ECR에 이미지 push
4. EC2에 SSH 접속하여 이미지 pull & 컨테이너 교체

### 6-3. GitHub Secrets (필수)

| Secret | 설명 | 비고 |
|--------|------|------|
| `AWS_ACCESS_KEY_ID` | AWS IAM 액세스 키 | ECR/EC2 접근용 |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM 시크릿 키 | |
| `EC2_HOST` | EC2 퍼블릭 IP | |
| `EC2_USERNAME` | SSH 사용자명 | 보통 `ec2-user` |
| `EC2_SSH_KEY` | SSH 프라이빗 키 | PEM 형식 |
| `PAYLOAD_SECRET` | JWT 서명용 시크릿 | 32자 이상 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 | EC2 DB용 |

### 6-4. EC2 초기 설정 (최초 배포 후 1회)

첫 배포 후 로컬에서 시드한 DB 데이터를 EC2로 이전해야 합니다.

> **SSH 키 파일**: 프로젝트 루트의 `ninewatt-homepage.pem`을 사용합니다.
> 권한이 열려 있으면 `chmod 400 ninewatt-homepage.pem`으로 변경해야 합니다.

```bash
# 1. 로컬에서 DB dump
docker exec ninewatt_homepage_next-db-1 pg_dump -U ninewatt ninewatt > /tmp/ninewatt-dump.sql

# 2. EC2로 파일 전송
scp -i ./ninewatt-homepage.pem /tmp/ninewatt-dump.sql ec2-user@<EC2_HOST>:~/

# 3. EC2 접속
ssh -i ./ninewatt-homepage.pem ec2-user@<EC2_HOST>

# 4. DB에 데이터 복원
docker exec -i ninewatt-db psql -U ninewatt ninewatt < ~/ninewatt-dump.sql

# 5. 앱 로그 확인
docker logs ninewatt-homepage --tail 20
```

복원 완료 후 `http://<EC2_HOST>:3000/admin`에서 Admin UI에 접속할 수 있습니다.

### 6-5. EC2 운영 참고

```bash
# EC2 접속
ssh -i ./ninewatt-homepage.pem ec2-user@<EC2_HOST>

# 컨테이너 상태 확인
docker ps

# 앱 로그 확인
docker logs ninewatt-homepage --tail 50

# DB 로그 확인
docker logs ninewatt-db --tail 20

# 앱 재시작
docker restart ninewatt-homepage

# DB 백업
docker exec ninewatt-db pg_dump -U ninewatt ninewatt > ~/backup-$(date +%Y%m%d).sql
```

### 6-6. DB 백업 및 복구

#### 데이터 저장 위치

DB 데이터는 EC2의 Docker 볼륨(`ninewatt-pgdata`)에 저장됩니다.

| 상황 | 데이터 | 조치 |
|------|--------|------|
| EC2 **재부팅/중지→시작** | 유지됨 | `docker start ninewatt-db`로 재시작 |
| EC2 **종료(Terminate)** | **삭제됨** | 사전 백업 필수 |
| EBS 볼륨 장애 | **손실 가능** | 자동 백업 권장 |

#### 수동 백업/복구

```bash
# EC2에서 수동 백업
docker exec ninewatt-db pg_dump -U ninewatt ninewatt > ~/backup-$(date +%Y%m%d).sql

# 백업 파일을 로컬로 다운로드
scp -i ./ninewatt-homepage.pem ec2-user@<EC2_HOST>:~/backup-*.sql ./backups/

# 복구 (필요 시)
docker exec -i ninewatt-db psql -U ninewatt ninewatt < ~/backup-20260319.sql
```

#### 자동 백업 (S3, 권장)

EC2에서 cron으로 매일 S3에 백업하는 설정:

```bash
# EC2에 접속 후 백업 스크립트 생성
cat > ~/db-backup.sh << 'SCRIPT'
#!/bin/bash
BACKUP_FILE="/tmp/ninewatt-backup-$(date +%Y%m%d-%H%M%S).sql"
docker exec ninewatt-db pg_dump -U ninewatt ninewatt > "$BACKUP_FILE"
aws s3 cp "$BACKUP_FILE" s3://<YOUR_BUCKET>/db-backups/
rm "$BACKUP_FILE"
# 30일 이상된 백업 삭제
aws s3 ls s3://<YOUR_BUCKET>/db-backups/ | awk '{print $4}' | while read file; do
  file_date=$(echo "$file" | grep -o '[0-9]\{8\}')
  if [ $(( ($(date +%s) - $(date -d "$file_date" +%s)) / 86400 )) -gt 30 ]; then
    aws s3 rm "s3://<YOUR_BUCKET>/db-backups/$file"
  fi
done
SCRIPT
chmod +x ~/db-backup.sh

# 매일 새벽 3시 자동 실행
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ec2-user/db-backup.sh") | crontab -
```

> S3 버킷과 IAM 권한 설정이 필요합니다. 간단하게는 수동 백업만으로도 충분합니다.

### 6-7. Docker Compose (로컬 전체 스택 테스트)

```bash
# 프로덕션 환경변수 설정
export DB_PASSWORD=secure-password-here
export PAYLOAD_SECRET=your-production-secret-min-32-chars

# 빌드 및 실행
docker compose up --build -d
```

### 6-8. 환경 변수

| 변수 | 설명 | 필수 | 위치 |
|------|------|:----:|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | O | 런타임 |
| `PAYLOAD_SECRET` | JWT 서명용 시크릿 (32자 이상) | O | 빌드 + 런타임 |

---

## 7. 코드와 DB의 관계

코드 배포와 DB 데이터는 **독립적으로 동작**합니다.

| 작업 | 앱 코드 | DB 데이터 |
|------|:-------:|:---------:|
| `git push` → 배포 | 갱신됨 | 변경 없음 |
| Admin UI에서 데이터 수정 | 변경 없음 | 갱신됨 |
| Collection/Global 스키마 변경 후 배포 | 갱신됨 | Payload가 자동 마이그레이션 |

**예시:**
- "수상 내역 1건 추가" → Admin UI에서 추가. 코드 수정 불필요.
- "수상 내역에 '카테고리' 필드 추가" → `src/collections/Awards.ts`에 필드 추가 → push → 배포 후 Admin UI에 새 필드 노출

---

## 9. 알려진 이슈 및 해결

### Next.js 16 호환성

Payload CMS 3.79.1은 공식적으로 `Next.js >=16.2.0-canary.10`을 요구하지만,
현재 프로젝트는 Next.js 16.1.7을 사용합니다. `@next/env`의 default export 문제를
`patches/payload@3.79.1.patch`로 해결했습니다.

- 패치 내용: `import nextEnvImport from '@next/env'` → `import * as nextEnvModule from '@next/env'`
- `pnpm install` 시 자동 적용됩니다
- Payload 버전 업데이트 시 패치가 불필요해질 수 있습니다

### importMap.js

`src/app/(payload)/admin/importMap.js`는 Payload가 자동 생성하는 파일입니다.
Docker 빌드 시 필요하므로 **git에 포함**되어 있습니다 (.gitignore에서 제외).
로컬 `pnpm dev` 실행 시 Payload가 자동으로 내용을 갱신합니다.

### 로컬 PostgreSQL 포트 충돌

Homebrew PostgreSQL이 설치되어 있으면 Docker의 5432 포트와 충돌합니다:

```bash
# Homebrew PostgreSQL 중지
brew services stop postgresql@14
brew services stop postgresql@18

# Docker DB만 사용
docker compose up db -d
```

---

## 10. 개발자 참고

### 새 Collection 추가

1. `src/collections/NewCollection.ts` 생성
2. `payload.config.ts`의 `collections` 배열에 추가
3. `src/lib/cms.ts`에 조회 함수 추가
4. 페이지에서 `import { getNewCollection } from "@/lib/cms"` 사용

### 새 Global 추가

1. `src/globals/NewGlobal.ts` 생성
2. `payload.config.ts`의 `globals` 배열에 추가
3. `src/lib/cms.ts`에 조회 함수 추가

### 페이지에서 CMS 데이터 사용

```tsx
// 서버 컴포넌트에서 직접 호출
import { getAwards } from "@/lib/cms";

export default async function Page({ params }) {
  const { locale } = await params;
  const { docs: awards } = await getAwards(locale);
  // awards 사용...
}
```

### 클라이언트 컴포넌트에서 CMS 데이터 사용

클라이언트 컴포넌트(`"use client"`)는 `payload.find()`를 직접 호출할 수 없습니다.
서버 부모 컴포넌트에서 데이터를 fetch하고 props로 전달하세요:

```tsx
// page.tsx (서버)
const { docs } = await getRndProjects(locale);
return <ClientComponent data={docs} />;

// ClientComponent.tsx (클라이언트)
"use client";
export function ClientComponent({ data }) { ... }
```

### 주요 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `payload` | 3.79.1 | CMS 코어 |
| `@payloadcms/next` | 3.79.1 | Next.js 통합 |
| `@payloadcms/db-postgres` | 3.79.1 | PostgreSQL 어댑터 |
| `@payloadcms/richtext-lexical` | 3.79.1 | 리치텍스트 에디터 |
| `@next/env` | 16.1.7 | 환경변수 로딩 (Payload 호환용) |
