# Payload CMS 사용 가이드

Ninewatt 홈페이지는 Payload CMS 3.x를 사용하여 콘텐츠를 관리합니다.

---

## 1. 초기 설정

### 1-1. PostgreSQL 실행

**Docker Compose (권장)**

```bash
docker compose up db -d
```

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

> **프로덕션 배포 시** `PAYLOAD_SECRET`을 반드시 변경하세요.

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
└── app/(payload)/             ← Admin UI 라우트
    ├── layout.tsx
    ├── admin/[[...segments]]/
    └── api/[...slug]/
```

---

## 6. 배포

### Docker Compose (전체 스택)

```bash
# 프로덕션 환경변수 설정
export DB_PASSWORD=secure-password-here
export PAYLOAD_SECRET=your-production-secret-min-32-chars

# 빌드 및 실행
docker compose up --build -d
```

### 환경 변수 (프로덕션 필수)

| 변수 | 설명 | 필수 |
|------|------|:----:|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | O |
| `PAYLOAD_SECRET` | JWT 서명용 시크릿 (32자 이상) | O |

---

## 7. 개발자 참고

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
