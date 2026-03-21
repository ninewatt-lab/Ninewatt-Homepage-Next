# Payload CMS 통합 가이드

> 이 문서는 나인와트 홈페이지에 Payload CMS 3.x를 통합했던 과정을 기록한 것입니다.
> 최종 개발 완료 후 CMS를 재통합할 때 참고하세요.

## 아키텍처 개요

- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL 16 + Drizzle ORM (`@payloadcms/db-postgres`)
- **Rich Text Editor**: Lexical (`@payloadcms/richtext-lexical`)
- **Admin UI**: Payload 내장 (`@payloadcms/next`, `@payloadcms/ui`)
- **다국어 지원**: Payload 로케일 (ko, en, ja, fr)

## 필요한 패키지

```json
{
  "@payloadcms/db-postgres": "^3.79.1",
  "@payloadcms/next": "^3.79.1",
  "@payloadcms/richtext-lexical": "^3.79.1",
  "@payloadcms/ui": "^3.79.1",
  "payload": "^3.79.1",
  "@next/env": "^16.1.7",
  "dotenv": "^17.3.1"
}
```

## 환경 변수

```
DATABASE_URL=postgresql://ninewatt:ninewatt@localhost:5432/ninewatt
PAYLOAD_SECRET=ninewatt-payload-secret-key-change-in-production-min-32-chars
```

## 설정 파일

### `payload.config.ts` (프로젝트 루트)

```typescript
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

// Collections & Globals imports...

export default buildConfig({
  admin: { user: "users", importMap: { baseDir: path.resolve(dirname) } },
  collections: [Users, Media, Awards, Certifications, History, Patents, Partners, RndProjects],
  globals: [CompanyInfo, HomeStats, Executives, Organization, Career, GlobalBusiness, Products],
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || "" } }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "src/payload-types.ts") },
  localization: {
    locales: [
      { label: "한국어", code: "ko" },
      { label: "English", code: "en" },
      { label: "日本語", code: "ja" },
      { label: "Français", code: "fr" },
    ],
    defaultLocale: "ko",
  },
  sharp,
});
```

### `next.config.ts`

```typescript
import { withPayload } from "@payloadcms/next/withPayload";
export default withPayload(withNextIntl(nextConfig));
```

### `tsconfig.json`

```json
"paths": {
  "@/*": ["./src/*"],
  "@payload-config": ["./payload.config.ts"]
}
```

## Collections (8개)

| Collection | 슬러그 | 설명 |
|---|---|---|
| Users | `users` | 관리자 인증, role 기반 접근 제어 |
| Media | `media` | 이미지/PDF 업로드 (`public/media`) |
| Awards | `awards` | 수상 내역 (year 인덱스) |
| Certifications | `certifications` | 인증서 (sortOrder) |
| History | `history` | 연혁 (로컬라이즈, year 인덱스) |
| Patents | `patents` | 특허 (국내/해외 구분, 로컬라이즈) |
| Partners | `partners` | 파트너/고객사 (카테고리, sortOrder) |
| RndProjects | `rnd-projects` | R&D 과제 (탭/그룹/배열 중첩 필드) |

## Globals (7개)

| Global | 슬러그 | 설명 |
|---|---|---|
| CompanyInfo | `company-info` | 회사명, 주소, 연락처, SNS 링크 |
| HomeStats | `home-stats` | 홈페이지 통계 수치 |
| Executives | `executives` | 임원 정보 |
| Organization | `organization` | 조직 구성 |
| Career | `career` | 채용 페이지 (문화, 인재상, 복리후생, 채용 절차) |
| GlobalBusiness | `global-business` | 해외 사업 현황 |
| Products | `products` | 제품별 서비스 URL |

## 데이터 흐름

```
PostgreSQL DB
  → payload.find() / payload.findGlobal()
    → src/lib/cms.ts (데이터 접근 레이어)
      → 각 페이지 서버 컴포넌트
```

- Collection 함수: `{ docs: [...] }` 형태로 반환
- Global 함수: 객체 직접 반환

## Next.js 라우트 구조

```
src/app/
├── (payload)/                    # Payload CMS 전용 라우트 그룹
│   ├── layout.tsx                # Payload RootLayout (별도 <html>/<body>)
│   ├── admin/[[...segments]]/    # Admin UI (/admin)
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   └── api/[...slug]/            # REST API (/api/*)
│       └── route.ts              # GET, POST, DELETE, PATCH, PUT, OPTIONS
└── layout.tsx                    # Root layout (children만 반환, <html> 없음)
```

**주의**: `(payload)` 라우트 그룹이 있을 때 root `layout.tsx`에서 `<html>/<body>`를 렌더링하면 안 됩니다. Payload의 layout이 자체적으로 `<html>/<body>`를 제공하기 때문입니다.

## Admin UI 커스터마이징

`src/components/admin/RowLabels.tsx`에 13개의 커스텀 Row Label 컴포넌트가 있었습니다:
- `useRowLabel` hook (`@payloadcms/ui`)을 사용
- 배열 필드의 각 항목에 의미 있는 레이블을 표시

## 배포 파이프라인

### 빌드 시 DB 필요
Payload는 빌드 타임에 DB 연결이 필요합니다 (스키마 생성). GitHub Actions에서 임시 PostgreSQL 서비스 컨테이너를 사용했습니다.

### Dockerfile 구조
```
base → deps → builder → migrator (스키마 push)
                       → runner (프로덕션)
```

### EC2 배포
1. PostgreSQL 컨테이너 (`ninewatt-db`)를 `ninewatt-net` 네트워크에 생성
2. Migrator 이미지로 DB 스키마 push (`npx tsx scripts/push-db-schema.ts`)
3. 앱 컨테이너를 같은 네트워크에 배포

## Seed 데이터

`src/seed/index.ts`로 초기 데이터를 투입했습니다:
- 관리자 계정 생성 (`admin@ninewatt.com`)
- 기존 정적 데이터 파일(`src/data/`)에서 awards, certifications, history, patents 임포트
- R&D 프로젝트, 회사 정보, 통계, 임원, 조직, 채용, 해외사업, 제품 URL은 seed 파일에 직접 작성

현재 이 데이터들은 `src/data/` 디렉토리의 정적 TypeScript 파일로 관리 중입니다.

## 재통합 체크리스트

1. [ ] Payload 패키지 설치 (`@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/ui`, `payload`)
2. [ ] PostgreSQL 설정 (`DATABASE_URL`, `PAYLOAD_SECRET` 환경 변수)
3. [ ] `payload.config.ts` 생성 (위 설정 참고)
4. [ ] `tsconfig.json`에 `@payload-config` path alias 추가
5. [ ] `next.config.ts`에 `withPayload` 래핑
6. [ ] Collections 디렉토리 생성 (`src/collections/`)
7. [ ] Globals 디렉토리 생성 (`src/globals/`)
8. [ ] `src/app/(payload)/` 라우트 그룹 생성 (admin + API)
9. [ ] Root `layout.tsx`에서 `<html>/<body>` 제거 (children만 반환)
10. [ ] `src/lib/payload.ts` 생성 (Payload 클라이언트)
11. [ ] `src/lib/cms.ts`를 Payload API 호출로 교체
12. [ ] Admin Row Label 컴포넌트 생성 (`src/components/admin/`)
13. [ ] Seed 스크립트 작성 및 실행
14. [ ] Dockerfile에 migrator 스테이지 추가
15. [ ] GitHub Actions에 PostgreSQL 서비스 컨테이너 추가
16. [ ] `npx payload generate:types` 실행
