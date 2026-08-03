# SEO 개선 실행 계획

> 작성일: 2026-07-31 · 대상: ninewatt_homepage_next (Next.js 16 App Router, next-intl 4-locale)
> 기준 도메인: **https://ninewatt.com** (apex 정식, `www`는 apex로 301)

## 요약

현재 사이트는 콘텐츠 규모(45 페이지 × 4 언어 = 약 180 URL)는 충분하지만, **검색엔진이 그것을 발견하고 해석할 수단이 거의 없다.** sitemap·robots·hreflang·구조화 데이터가 전부 부재하고, 메타데이터에 검색 키워드가 하나도 없다.

추가로 코드 점검 중 **의도치 않은 중복 콘텐츠 40 URL**을 발견했다 (§2). 이것이 배관 부재보다 순위에 더 직접적인 악영향을 줄 수 있다.

우선순위 (효과 대비 비용):

| 순위 | 항목 | 예상 공수 | 효과 | 판단 필요 |
|---|---|---|---|---|
| **P0** | 검색엔진 등록 (Search Console·네이버) | 30분 | 필수 전제 | 없음 |
| **P0** | `sitemap.ts` + `robots.ts` | 1시간 | 높음 | 없음 |
| **P0** | `metadataBase` + canonical + hreflang | 2–3시간 | **매우 높음** | 없음 |
| **P1** | product / energy/products 중복 해소 | 반나절 | **매우 높음** | ✅ 사업 판단 |
| **P1** | 메타데이터 문안 재작성 (title·description) | 1일 | 높음 | ✅ 키워드 전략 |
| **P2** | Open Graph / Twitter 카드 | 2시간 | 중간(공유 전환율) | OG 이미지 디자인 |
| **P2** | JSON-LD 구조화 데이터 | 반나절 | 중간~높음 | 없음 |
| **P3** | `"use client"` 페이지 4개 서버 렌더 전환 | 1일 | 중간 | 없음 |
| **P3** | `energy.ninewatt.com` 서브도메인 통합 | 별도 과제 | 장기적으로 높음 | ✅ 전략 판단 |

---

## 1. P0 — 검색엔진 등록 (코드 외 작업)

코드를 아무리 고쳐도 등록이 안 되어 있으면 아무 일도 일어나지 않는다. **가장 먼저 할 일.**

1. **Google Search Console** — https://search.google.com/search-console
   - `ninewatt.com` 도메인 속성으로 등록 (DNS TXT 방식 권장, Cloudflare에서 레코드 추가)
   - 도메인 속성이면 `www`·서브도메인·http/https 전부 한 번에 커버됨
2. **네이버 서치어드바이저** — https://searchadvisor.naver.com
   - 국내 B2B 리드 유입에는 네이버가 구글만큼 중요하다. 절대 빠뜨리지 말 것
   - HTML 태그 방식이면 아래 `verification` 필드로 처리 (§3.3)
3. **Bing Webmaster Tools** — 해외(en/ja/fr) 트래픽 대비. Search Console에서 가져오기 가능
4. 등록 후 각 콘솔에 **사이트맵 2개**를 제출
   - `https://ninewatt.com/sitemap.xml` — 본 사이트 (100 URL)
   - `https://energy.ninewatt.com/sitemap.xml` — 에너지 사업부 (10 URL, ko 전용)
   - 에너지 콘텐츠의 정식 호스트는 `energy.ninewatt.com`이다. `sitemap.ts`·`robots.ts`가
     요청 Host를 보고 자기 URL만 내보내므로 두 사이트맵은 서로 겹치지 않는다.
     도메인 속성(DNS TXT)으로 등록했다면 서브도메인이 이미 커버되므로 속성을
     따로 만들 필요 없이 같은 속성에서 두 URL을 제출하면 된다.

> 등록 직후 데이터는 안 쌓인다. 색인 반영까지 2–4주, 순위 안정화까지 2–3개월 걸린다는 전제로 일정을 잡을 것.

---

## 2. P1 — 중복 콘텐츠 40 URL (가장 시급한 구조 문제)

### 문제

동일 제품 페이지가 두 경로에 거의 그대로 존재한다:

| 제품 | 경로 A | 경로 B | 파일 라인수 | diff |
|---|---|---|---|---|
| bems | `/product/bems` | `/energy/products/bems` | 168 / 168 | 26줄 |
| peak-ess | `/product/peak-ess` | `/energy/products/peak-ess` | 258 / 258 | 38줄 |
| shared-ess | `/product/shared-ess` | `/energy/products/shared-ess` | 424 / 424 | 86줄 |
| solar-site | `/product/solar-site` | `/energy/products/solar-site` | 277 / 278 | 51줄 |
| pv-intelligence | `/product/pv-intelligence` | `/energy/products/pv-intelligence` | 285 / 283 | 44줄 |

diff 대부분은 import 경로·내부 링크 차이이고 **본문 콘텐츠는 사실상 동일**하다.
5 제품 × 2 경로 × 4 언어 = **40개 근중복 URL**.

### 왜 나쁜가

- 구글이 둘 중 하나를 임의로 정식(canonical)으로 고르고 나머지를 색인에서 누락시킨다 — 어느 쪽이 선택될지 통제 불가
- 같은 키워드로 자사 페이지 두 개가 서로 경쟁해 순위 신호가 분산된다
- 외부 백링크가 두 URL로 쪼개져 권위가 절반씩 낭비된다

### 선택지 (사업 판단 필요)

**A안 — `/product/*`를 정식으로, `/energy/products/*`는 301 리다이렉트** (권장)
`/product`는 회사 전체 제품 카탈로그의 자연스러운 위치이고 경로가 짧다. `energy` 세그먼트는 사업부 구분일 뿐 사용자 검색 의도와 무관하다.

**B안 — `/energy/products/*`를 정식으로, `/product/*`는 301**
에너지 사업부를 독립 브랜드로 키울 계획이면 이쪽. 단 기존 `/product` 색인 자산을 포기해야 한다.

**C안 — 양쪽 유지 + canonical 태그로 한쪽 지정**
리다이렉트 없이 중복 신호만 제거. 두 경로가 서로 다른 내비게이션 문맥에서 필요한 경우에만. 유지보수 비용이 계속 발생하므로 차선책.

> 어느 안이든 **결정 후 sitemap에는 정식 URL만 넣어야 한다.** 리다이렉트되는 URL을 sitemap에 넣는 것은 그 자체로 감점 요인이다.

### 부수 발견 — `/solar/*` 5개 페이지는 죽은 코드

[next.config.ts](../next.config.ts)의 `/:locale/solar/:path*` → `/:locale/energy/solar/:path*` 301 때문에 아래 파일들은 **절대 렌더되지 않는다**:

```
src/app/[locale]/solar/page.tsx
src/app/[locale]/solar/contact/page.tsx
src/app/[locale]/solar/monitoring/page.tsx
src/app/[locale]/solar/services/page.tsx
src/app/[locale]/solar/sites/page.tsx
```

빌드 시간·번들 혼선만 유발하므로 삭제 대상. (301은 기존 색인 이전을 위해 **유지**해야 한다 — 최소 1년.)

---

## 3. P0 — 메타데이터 배관

### 3.1 공통 헬퍼 (먼저 만들 것)

⚠️ **중요한 함정**: `alternates.canonical`을 `[locale]/layout.tsx`에 넣으면 **모든 하위 페이지가 그 값을 상속**해서 45개 페이지 전부 canonical이 `/ko`로 잡힌다. 치명적인 역효과. 반드시 페이지별로 지정해야 하므로 헬퍼를 만들어 각 페이지에서 호출한다.

`src/lib/seo.ts` (신규):

```ts
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = "https://ninewatt.com";

/** 페이지별 메타데이터 생성. path는 로케일을 제외한 경로 ("/product/bems", 홈은 "/") */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImage = "/images/og-default.png",
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}): Metadata {
  const rel = (l: string) => `/${l}${path === "/" ? "" : path}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: rel(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, rel(l)])),
        "x-default": rel(routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Ninewatt",
      locale,
      url: rel(locale),
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}
```

각 페이지에서:

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  return buildMetadata({
    locale,
    path: "/product/bems",
    title: t("bems.metaTitle"),
    description: t("bems.metaDescription"),
  });
}
```

> `x-default`는 언어 매칭이 안 되는 사용자에게 보여줄 기본판을 뜻한다. 국내 B2B이므로 `ko`로 지정.

### 3.2 `sitemap.ts`

`src/app/sitemap.ts` (신규). §2 결정에 따라 중복 경로를 제거한 목록만 넣는다:

```ts
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

type Freq = "weekly" | "monthly" | "yearly";

// priority는 사업 중요도 기준 수동 관리. 리다이렉트되는 경로(/solar/*)는 절대 포함 금지.
const ROUTES: { path: string; priority: number; freq: Freq }[] = [
  { path: "/", priority: 1.0, freq: "weekly" },

  // 제품 — 전환에 직결되므로 최상위 우선순위
  { path: "/product", priority: 0.9, freq: "monthly" },
  { path: "/product/shared-ess", priority: 0.9, freq: "monthly" },
  { path: "/product/peak-ess", priority: 0.9, freq: "monthly" },
  { path: "/product/bems", priority: 0.9, freq: "monthly" },
  { path: "/product/solar-site", priority: 0.9, freq: "monthly" },
  { path: "/product/pv-intelligence", priority: 0.9, freq: "monthly" },
  { path: "/product/greenplanner", priority: 0.8, freq: "monthly" },
  { path: "/product/repark", priority: 0.8, freq: "monthly" },

  // 솔루션
  { path: "/solutions", priority: 0.8, freq: "monthly" },
  { path: "/solutions/services", priority: 0.7, freq: "monthly" },
  { path: "/solutions/cases", priority: 0.8, freq: "weekly" },
  { path: "/solutions/watti", priority: 0.7, freq: "monthly" },
  { path: "/solutions/opti", priority: 0.7, freq: "monthly" },
  { path: "/solutions/save-e", priority: 0.7, freq: "monthly" },
  { path: "/solutions/rnd", priority: 0.6, freq: "monthly" },
  { path: "/solutions/global", priority: 0.6, freq: "monthly" },

  // 에너지 사업부
  { path: "/energy", priority: 0.8, freq: "monthly" },
  { path: "/energy/ess", priority: 0.8, freq: "monthly" },
  { path: "/energy/ess/monitoring", priority: 0.6, freq: "monthly" },
  { path: "/energy/ess/services", priority: 0.6, freq: "monthly" },
  { path: "/energy/solar", priority: 0.8, freq: "monthly" },
  { path: "/energy/solar/monitoring", priority: 0.6, freq: "monthly" },
  { path: "/energy/solar/services", priority: 0.6, freq: "monthly" },
  { path: "/energy/solar/sites", priority: 0.6, freq: "weekly" },
  { path: "/energy/ppa", priority: 0.8, freq: "monthly" },

  // 회사 — 신뢰 신호. 채용·수상·특허는 브랜드 검색에서 잘 걸린다
  { path: "/company", priority: 0.7, freq: "monthly" },
  { path: "/company/history", priority: 0.5, freq: "yearly" },
  { path: "/company/awards", priority: 0.6, freq: "monthly" },
  { path: "/company/patents", priority: 0.6, freq: "monthly" },
  { path: "/company/papers", priority: 0.6, freq: "monthly" },
  { path: "/company/media", priority: 0.7, freq: "weekly" },
  { path: "/company/career", priority: 0.7, freq: "weekly" },

  // 전환 페이지
  { path: "/contact", priority: 0.9, freq: "yearly" },
  { path: "/energy/contact", priority: 0.7, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const rel = (l: string, p: string) => `${SITE_URL}/${l}${p === "/" ? "" : p}`;

  return ROUTES.flatMap(({ path, priority, freq }) =>
    routing.locales.map((locale) => ({
      url: rel(locale, path),
      lastModified: now,
      changeFrequency: freq,
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, rel(l, path)]),
        ),
      },
    })),
  );
}
```

> `lastModified: new Date()`는 빌드 시각이므로 매 배포마다 전체 URL이 "수정됨"으로 표시된다. 정직하지 않은 신호이고 크롤 예산을 낭비한다. 개선안: CMS 도입 후 콘텐츠 `updatedAt`을 쓰거나, `git log -1 --format=%cI -- <file>`을 빌드 시 주입.

### 3.3 `robots.ts`

`src/app/robots.ts` (신규):

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

> Payload CMS 도입 시 `disallow`에 `/admin/`을 추가할 것. (현재 미설치 — 루트 레이아웃의 `(payload)` 주석은 예정 사항)

### 3.4 검색엔진 소유 확인 태그

`[locale]/layout.tsx`의 `generateMetadata`에 추가 (여기는 canonical과 달리 상속되어도 무해):

```ts
verification: {
  google: process.env.GOOGLE_SITE_VERIFICATION,
  other: { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION ?? "" },
},
```

---

## 4. P1 — 메타데이터 문안 재작성 (키워드 전략)

### 현재 상태

`src/messages/ko/common.json`:

```json
{ "title": "Ninewatt - 나인와트", "description": "Ninewatt 공식 홈페이지" }
```

이 description이 구글 검색결과 스니펫에 **그대로 노출된다.** 고객이 실제로 검색하는 단어가 0개다. 페이지별로도 [product/page.tsx](../src/app/[locale]/\(main\)/product/page.tsx#L6)의 `"Product - Ninewatt"`처럼 하드코딩되어 4개 언어가 동일하다.

### 원칙

- **title**: 55자 이내. `핵심 키워드 | 브랜드` 순서. 브랜드를 앞에 두면 키워드가 잘린다
- **description**: 150–160자. 키워드 나열이 아니라 **클릭할 이유**를 쓴다. 순위 요소는 아니지만 클릭률(CTR)을 좌우하고, CTR은 순위에 영향을 준다
- 45개 페이지 전부 **고유해야** 한다. 중복 description은 Search Console에서 경고로 잡힌다
- 4개 언어를 기계 번역하지 말 것. 언어별로 검색어가 다르다 (예: ko "피크저감" ↔ en "peak shaving" ↔ ja "ピークカット")

### 노려야 할 키워드 축 (검증 필요)

실제 검색량은 네이버 키워드도구·구글 키워드플래너로 확인해야 하지만, 제품 구성상 다음 축이 후보다:

| 축 | 후보 키워드 | 대응 페이지 |
|---|---|---|
| ESS | 공용ESS, 피크저감 ESS, ESS 구축, 전기요금 절감 | `/product/shared-ess`, `/product/peak-ess` |
| 태양광 | 태양광 발전소 관리, PV 모니터링, 발전량 예측 | `/product/pv-intelligence`, `/energy/solar` |
| 건물에너지 | BEMS, 건물에너지관리시스템, 에너지 진단 | `/product/bems` |
| PPA | 기업 PPA, 재생에너지 PPA, RE100 | `/energy/ppa` |
| 브랜드 | 나인와트, Ninewatt | `/`, `/company` |

> **롱테일 우선 전략**을 권한다. "ESS" 단일 키워드는 대기업과 경쟁해 승산이 낮다. "공장 피크저감 ESS 도입 비용"처럼 구체적인 구매 의도 키워드가 리드 전환율도 훨씬 높다.

### 문안 예시 (`/product/peak-ess`, ko)

```
title:       AI 피크저감 ESS 제어 | 전기요금 최대 30% 절감 — Ninewatt
description: 나인와트 Peak ESS는 AI가 부하 패턴을 예측해 피크 시간대 자동 방전으로
             기본요금을 낮춥니다. 공장·건물 대상 도입 사례와 절감액 시뮬레이션을 확인하세요.
```

> "30%" 같은 수치는 **실제 검증된 값으로만** 써야 한다. 근거 없는 수치는 표시광고법 리스크가 있다. 실측 데이터를 확인 후 확정할 것.

### 작업 방식 제안

45페이지 × 4언어 = 180개 문안을 한 번에 하면 품질이 떨어진다. 단계적으로:

1. 1차: 홈 + 제품 8개 + `/contact` = 10페이지 (전환 직결)
2. 2차: 솔루션 8개 + 에너지 9개
3. 3차: 회사 7개 + 나머지

메시지 파일에 `metaTitle` / `metaDescription` 키를 페이지별 네임스페이스에 추가하는 구조로.

---

## 5. P2 — Open Graph / Twitter 카드

현재 OG 태그가 전무해서 **카카오톡·슬랙으로 링크를 공유하면 썸네일도 제목도 없이 맨 URL만 뜬다.** B2B 영업에서 링크 공유는 주요 유입 경로이므로 체감 손실이 크다.

§3.1의 `buildMetadata` 헬퍼에 이미 포함되어 있으므로, 필요한 것은 **OG 이미지 제작**뿐:

- 규격 1200×630px
- 최소 1장: `/images/og-default.png` (로고 + 태그라인)
- 이상적으로는 제품별 8장 — 기존 `public/images`, `public/logos` 자산 활용 가능
- 또는 Next.js `ImageResponse`로 동적 생성 (`src/app/[locale]/opengraph-image.tsx`) — 제품명을 런타임에 렌더링해 문안 변경 시 이미지 재작업 불필요

검증: https://developers.facebook.com/tools/debug/ 및 카카오 개발자 도구

---

## 6. P2 — JSON-LD 구조화 데이터

`application/ld+json` 검색 결과 **0건**. 구글·네이버가 회사 정체성을 구조적으로 이해할 수단이 없다.

### 6.1 Organization (최우선 — 브랜드 지식패널)

`[locale]/layout.tsx`에서 한 번만 렌더:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "나인와트",
    alternateName: "Ninewatt",
    url: "https://ninewatt.com",
    logo: "https://ninewatt.com/logos/ninewatt-logo.png",
    description: "AI 기반 에너지 관리 솔루션 기업",
    email: "ninewatt@ninewatt.com",
    telephone: "+82-70-8866-7226",
    address: { "@type": "PostalAddress", addressCountry: "KR", /* 주소 — Footer 값 사용 */ },
    sameAs: ["https://www.instagram.com/9ninewatt/" /* + LinkedIn, YouTube 등 */],
  })}}
/>
```

> 값은 [Footer.tsx](../src/components/Footer.tsx)의 실제 표기(대표자·사업자등록번호·연락처)와 **반드시 일치**시켜야 한다. 불일치는 신뢰 신호를 깎는다.

### 6.2 Product (제품 8페이지)

`Product` + `Offer`. 가격 비공개면 `Offer` 대신 `PropertyValue`로 스펙만 기술.

### 6.3 BreadcrumbList (계층 페이지 전부)

`/product/bems`처럼 2단 이상 경로에 적용. 검색결과에 경로가 표시되어 CTR이 오른다.

### 6.4 그 외 후보

- `FAQPage` — 챗봇(`src/components/chatbot`)에 이미 QA 데이터가 있다면 재활용해 리치 결과 확보
- `NewsArticle` / `Article` — `/company/media`, `/company/papers`
- `JobPosting` — `/company/career`. 구글 채용 검색에 노출됨

검증: https://search.google.com/test/rich-results

---

## 7. P3 — 클라이언트 렌더링 페이지

아래 4개는 `"use client"`로 본문을 렌더링한다:

```
src/app/[locale]/solar/sites/page.tsx          ← §2에 따라 삭제 대상 (죽은 코드)
src/app/[locale]/solar/contact/page.tsx        ← 삭제 대상
src/app/[locale]/energy/solar/sites/page.tsx   ← 전환 필요
src/app/[locale]/energy/contact/page.tsx       ← 전환 필요
```

> ⚠️ **2026-08-02 정정.** 아래 원문은 틀렸다. Next.js App Router는 `"use client"` 컴포넌트도
> **첫 요청 때 서버에서 렌더링(SSR)** 하므로 본문이 초기 HTML에 들어간다. 라이브에서 확인한 결과
> `/energy/solar/sites`의 발전소 카드 7개와 주소가, `/energy/contact`의 폼 label 8개가 모두
> HTML에 존재했다. **JS를 실행하지 않는 크롤러도 이 콘텐츠를 볼 수 있다.**
>
> `"use client"`의 실제 비용은 색인 불가가 아니라 ① `generateMetadata` export 불가
> ② 클라이언트 번들 크기다. 클릭해야 나타나는 콘텐츠(아코디언 안쪽 등)라면 HTML에 없지만,
> 이 두 페이지는 기본 상태에서 전부 렌더된다. 우선순위는 P3가 맞다.

~~구글은 JS를 실행하지만 색인이 늦고 불완전하며, **네이버 크롤러는 JS 렌더링 지원이 훨씬 약하다.** 국내 유입이 중요하므로 실질적 문제다.~~

권장: 콘텐츠는 서버 컴포넌트로 렌더하고, 인터랙션이 필요한 부분(폼 상태, 지도 등)만 자식 클라이언트 컴포넌트로 분리. `/energy/solar/sites`의 발전소 목록은 서버에서 렌더하면 "태양광 발전소" 롱테일 키워드를 잡을 수 있는 자산이 된다.

---

## 8. P3 — 서브도메인 전략 (별도 과제)

[Footer.tsx:65](../src/components/Footer.tsx#L65)가 `https://energy.ninewatt.com/ko`를 가리키고 있다. 검색엔진은 서브도메인을 **별개 사이트로 취급하는 경향**이 있어 도메인 권위가 두 곳으로 분산된다.

- 통합안: `energy.ninewatt.com` → `ninewatt.com/energy`로 301. 권위가 한 도메인에 축적된다
- 유지안: 에너지 사업부를 독립 브랜드로 운영할 계획이면 유지. 단 백링크·콘텐츠를 양쪽에 각각 투자해야 한다

`/energy/*` 경로가 이미 본 사이트에 존재하므로 **현재는 사실상 같은 콘텐츠가 두 도메인에 있을 가능성**이 있다. 실제 응답을 확인해볼 것:

```bash
curl -sI https://energy.ninewatt.com/ko | head -20
curl -s https://energy.ninewatt.com/ko | grep -o '<title>[^<]*</title>'
```

---

## 9. 검증 및 측정

### 구현 후 즉시 확인

```bash
pnpm build && pnpm start

curl -s localhost:3000/sitemap.xml | head -40      # URL 수 = 라우트수 × 4
curl -s localhost:3000/robots.txt
curl -s localhost:3000/ko/product/bems | grep -oE '<(title|link rel="(canonical|alternate)"|meta (name|property)="[^"]*")[^>]*>'
```

체크리스트:

- [ ] sitemap URL 수가 예상과 일치하고, 리다이렉트 경로(`/solar/*`)가 없다
- [ ] 모든 페이지의 canonical이 **자기 자신**을 가리킨다 (§3.1 상속 함정)
- [ ] hreflang이 4언어 + `x-default` 상호 참조된다
- [ ] title·description이 페이지별로 고유하다
- [ ] Rich Results Test 통과

### 지속 측정

| 지표 | 도구 | 주기 |
|---|---|---|
| 색인된 페이지 수 | Search Console > 페이지 | 주 1회 |
| 검색 노출수·클릭수·CTR | Search Console > 실적 | 주 1회 |
| 키워드별 순위 | Search Console > 검색어 | 격주 |
| Core Web Vitals | Search Console > CWV / PageSpeed Insights | 월 1회 |
| 네이버 노출 | 서치어드바이저 > 사이트 최적화 | 월 1회 |

> **분석 도구가 전혀 없다.** GA4나 Vercel Analytics 도입을 함께 검토할 것. 어떤 검색어로 들어온 사람이 실제로 문의까지 이어지는지 모르면 SEO 투자 판단 근거가 없다.

---

## 10. 권장 실행 순서

```
1주차  §1 검색엔진 등록 + §3 배관(sitemap·robots·metadataBase·hreflang)
       → 여기까지가 전체 효과의 절반 이상. 판단 불필요, 바로 착수 가능

2주차  §2 중복 콘텐츠 결정 및 정리 + 죽은 /solar/* 삭제
       → A/B/C안 결정 필요. 결정 즉시 sitemap 갱신

3–4주차 §4 메타데이터 문안 1차(10페이지) + §5 OG 이미지
       → 키워드 조사 선행

5–6주차 §6 JSON-LD + §4 문안 2·3차

이후    §7 렌더링 전환, §8 서브도메인 전략
```

§1과 §3은 서로 독립적이고 판단이 필요 없으므로 **오늘 바로 시작 가능**하다.

---

# 11. GEO — 생성형 엔진 최적화 (추가 검토)

> GEO(Generative Engine Optimization) = ChatGPT·Claude·Perplexity·Google AI Overviews·네이버 Cue: 같은
> **AI 답변 엔진이 우리를 인용하도록** 만드는 작업. SEO는 "검색결과에 링크가 뜨는 것", GEO는 "AI가 답변 본문에서 우리를 언급하는 것"이다.

## 11.1 위 계획이 GEO에 해당하는가 — 절반만

| 항목 | SEO 효과 | GEO 효과 | 판정 |
|---|---|---|---|
| §6 JSON-LD 구조화 데이터 | 중간 | **매우 높음** | **P2 → P1 승격** |
| §7 클라이언트 렌더링 전환 | 낮음 | 낮음 | ~~P3 → P0 승격~~ **P3 유지** (아래 정정) |
| §3 sitemap·robots | 높음 | 중간 | AI 크롤러 정책 추가 필요 (§11.2) |
| §1 검색엔진 등록 | 필수 | 간접 | 그대로 |
| §2 중복 콘텐츠 해소 | 매우 높음 | 낮음 | 그대로 (SEO 사유로 진행) |
| §4 title·description 문안 | 높음 | **거의 무의미** | GEO 근거로는 우선순위 올리지 말 것 |
| §5 Open Graph | 중간 | 무관 | 그대로 |

**두 가지만 기억하면 된다.**

1. ~~**§7의 우선순위가 완전히 뒤바뀐다.**~~ **2026-08-02 정정 — 이 항목은 틀렸다.**

   원문은 "GPTBot·ClaudeBot·PerplexityBot이 JS를 거의 실행하지 않으므로 `"use client"` 페이지는 AI 엔진에게 존재하지 않는다"고 주장했다. 전제는 맞지만 결론이 틀렸다. **Next.js App Router가 클라이언트 컴포넌트를 SSR하므로 본문이 이미 초기 HTML에 있다.** 라이브 검증에서 발전소 카드·주소·폼 label이 전부 HTML에 존재했다.

   따라서 §7은 **P0가 아니라 원래대로 P3**다. GEO를 이유로 우선순위를 올릴 근거가 없다. 다만 클릭·스크롤 후에만 나타나는 콘텐츠는 여전히 HTML에 없으므로, 개별 페이지마다 `curl`로 확인하는 습관이 필요하다.
   ```bash
   curl -s https://ninewatt.com/ko/<path> | grep -c "<본문에_있어야_할_문구>"
   ```

2. **§4는 GEO에 별 도움이 안 된다.** AI 엔진은 `<meta description>`을 읽고 답하지 않는다. **본문 문단을 추출해 인용한다.** 즉 GEO의 핵심은 메타태그가 아니라 **본문이 인용 가능한 형태인가**다 (§11.4).

---

## 11.2 robots.txt의 AI 크롤러 정책 — 사업 판단 필요

§3.3의 `rules: [{ userAgent: "*", allow: "/" }]`는 AI 크롤러를 **암묵적으로 전부 허용**한다. 의도한 것이면 문제없지만, 명시적으로 결정하고 문서화할 사안이다.

B2B 리드 확보가 목표라면 **허용이 정답이다.** AI 답변에서 "국내 ESS 솔루션 업체"를 물었을 때 언급되는 것 자체가 영업 기회다. 콘텐츠 무단 학습이 걱정된다면 학습(training)용과 검색(search)용 크롤러를 분리 통제할 수 있다:

| 주체 | 학습용 | 검색·인용용 | 사용자 요청 시 |
|---|---|---|---|
| OpenAI | `GPTBot` | `OAI-SearchBot` | `ChatGPT-User` |
| Anthropic | `ClaudeBot` | `Claude-SearchBot` | `Claude-User` |
| Perplexity | — | `PerplexityBot` | `Perplexity-User` |
| Google | `Google-Extended` | (Googlebot 사용) | — |
| Apple | `Applebot-Extended` | (Applebot 사용) | — |
| Meta | `meta-externalagent` | — | — |
| Common Crawl | `CCBot` | — | — |

**"학습은 거부, 인용은 허용"** 전략 예시:

```ts
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      // 학습 목적 크롤러만 차단 (인용·검색용은 위 "*" 규칙으로 허용됨)
      { userAgent: ["GPTBot", "CCBot", "Google-Extended", "Applebot-Extended", "meta-externalagent", "Bytespider"], disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

주의할 점 세 가지:

- **`Google-Extended`를 차단해도 AI Overviews에서 사라지지 않는다.** AI Overviews는 일반 Googlebot 색인을 쓴다. Gemini 학습 데이터에서만 빠진다
- **`Bingbot`을 막으면 Microsoft Copilot에서 사라진다.** Copilot은 Bing 색인 기반이다
- **robots.txt 준수는 자율이다.** 일부 크롤러는 무시한다. 법적 강제력은 없다

> 권장: 초기에는 **전면 허용**으로 시작할 것. 노출이 곧 영업 자산인 단계에서 학습 차단의 실익이 크지 않다.

---

## 11.3 ⚠️ 이미 완벽한 GEO 콘텐츠를 갖고 있는데, 크롤러가 못 본다

**이 항목이 GEO에서 가장 큰 기회다.**

[src/lib/chatbot/systemPrompt.ts](../src/lib/chatbot/systemPrompt.ts)에 이미 아래 내용이 작성되어 있다:

```
30+ employees, 60+ delivered projects, 36+ patents, 96.81% YoY growth
CES innovation awards
Korean HQ in Incheon with R&D center in Seoul. Active in Japan, UK, France, and USA.

- Shared-ESS — Shared energy storage operation for clusters of buildings/sites.
- Peak-ESS — Peak shaving / demand-response ESS for industrial customers.
- BEMS — Building Energy Management System for offices, factories, hospitals.
  ...
```

그리고 [src/lib/chatbot/knowledgeBase.ts](../src/lib/chatbot/knowledgeBase.ts)(294줄)는 수상·특허·논문·인증·연혁·조직·R&D과제·기술이전·상표·해외사업 데이터를 마크다운으로 직렬화한다.

**이것은 AI 엔진이 인용하기에 이상적인 형태다** — 구체적 수치, 고유명사, 한 줄 정의, 계층 구조. GEO 컨설턴트에게 돈 주고 만들라고 하면 이렇게 만들어준다.

문제: 이 전체가 **Anthropic API 시스템 프롬프트로만 전송되는 TypeScript 문자열 상수**다. GPTBot도 ClaudeBot도 PerplexityBot도 **영원히 볼 수 없다.** 그 사이 홈페이지의 공식 설명은 `"Ninewatt 공식 홈페이지"` 여덟 글자다.

### 해야 할 일 — 같은 데이터를 크롤 가능한 형태로 한 번 더 노출

`src/data/*`가 단일 출처(SSOT)이므로 **콘텐츠를 새로 쓸 필요가 없다.** 렌더 타깃만 추가하면 된다:

**(a) `/llms.txt`** — `src/app/llms.txt/route.ts`

```ts
import { COMPANY_KNOWLEDGE } from "@/lib/chatbot/systemPrompt";

export const dynamic = "force-static";

export function GET() {
  return new Response(COMPANY_KNOWLEDGE, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

한 파일로 기존 자산이 즉시 크롤 가능해진다. **단, 정직하게 말하면**: llms.txt는 [llmstxt.org](https://llmstxt.org)의 제안 표준이고 주요 AI 제공사가 이를 읽는다고 공식 확인한 바는 없다. 공수가 30분이라 넣어둘 가치는 있지만 **이것만으로 효과를 기대하지는 말 것.** 아래 (b)(c)가 본체다.

**(b) 회사 개요 페이지 본문 강화** — `/company`가 `systemPrompt.ts` 수준의 구체성을 갖도록. 지금 챗봇만 아는 "96.81% YoY 성장", "60+ 프로젝트", "36+ 특허", "인천 본사 / 서울 R&D 센터 / 일본·영국·프랑스·미국 진출"이 **HTML 본문에** 있어야 한다.

**(c) FAQ 페이지 신설** — §11.4

> **부수 발견 (버그)**: [systemPrompt.ts:23](../src/lib/chatbot/systemPrompt.ts#L23)이 RE:park 경로를 `/product/re-park`로 안내하는데, 실제 라우트는 **`/product/repark`**다. 챗봇이 사용자에게 404 링크를 주고 있다. 하이픈 제거 필요.

---

## 11.4 콘텐츠를 "인용 가능한 단위"로 만들기 — GEO의 본체

AI 엔진은 페이지를 순위 매기지 않고 **문단을 추출해 인용한다.** 따라서 각 문단이 **문맥 없이도 홀로 성립**해야 한다.

### 원칙

1. **질문형 소제목** — 고객이 실제로 검색창에 치는 문장을 `<h2>`/`<h3>`로
   - ✗ "제품 특징" → ✓ "피크저감 ESS는 전기요금을 얼마나 줄이는가?"
2. **소제목 직후 2–3문장 직답** — 역피라미드. AI는 앞부분을 인용한다. 결론을 마지막에 두면 인용되지 않는다
3. **구체적 수치·고유명사** — AI는 모호한 주장을 인용하지 못한다
   - ✗ "혁신적인 AI 솔루션으로 비용을 절감합니다" → ✓ "2024년 인천 A공장 도입 후 월 기본요금 1,240만원 → 870만원"
4. **표·목록** — 추출 난이도가 가장 낮은 형태. 제품 스펙 비교표는 GEO 자산이다
5. **정의문** — "공용ESS란 ~이다" 형태의 한 문장 정의를 각 제품 페이지 최상단에
6. **출처·인용** — 이미 강점이 있다. [patents/page.tsx](../src/app/[locale]/\(main\)/company/patents/page.tsx)가 Google Patents로 직접 링크하고, `/company/papers`가 DOI를 노출한다. **검증 가능한 외부 출처는 AI 엔진의 신뢰 판단에 직접 기여한다.** 이 패턴을 제품 페이지 성과 수치에도 확대할 것

### FAQ 페이지 신설 (`/faq` 또는 제품 페이지 하단 섹션)

챗봇 `QuickReplies`에 이미 예상 질문이 정의되어 있고, 실제 챗봇 대화 로그가 쌓이면 **고객이 실제로 묻는 질문 목록**이 확보된다. 이것을 그대로 HTML FAQ로 발행하고 `FAQPage` JSON-LD를 붙인다.

효과가 두 겹이다: AI 엔진 인용 + 구글 리치 결과. GEO/SEO 양쪽에 동시에 듣는 드문 항목이라 **투자 대비 효율이 가장 좋다.**

> 챗봇 대화 로그를 분석해 상위 질문을 추출하는 것을 정기 업무로 만들 것. GEO 콘텐츠 소스가 자동으로 쌓인다.

---

## 11.5 엔티티 일관성 (오프사이트 — 코드 무관)

AI 엔진은 여러 출처를 교차 검증해 "나인와트란 무엇인가"라는 엔티티를 구축한다. 자사 사이트 하나만으로는 부족하다.

- **NAP 일관성** — 회사명·주소·전화번호 표기를 모든 곳에서 통일. [Footer.tsx](../src/components/Footer.tsx)·JSON-LD(§6.1)·네이버 스마트플레이스·사업자 등록 정보가 **한 글자도 다르지 않아야** 한다. "나인와트" / "(주)나인와트" / "Ninewatt Inc." 혼용은 엔티티를 쪼갠다
- **Wikidata 항목 생성** — 다수 AI 모델이 엔티티 기반으로 참조한다. 나무위키·위키백과 등재도 유효
- **산업 디렉토리** — 한국에너지공단, 신재생에너지협회, 벤처기업협회, Crunchbase, LinkedIn 회사 페이지
- **언론 보도** — `/company/media`에 보도가 쌓여 있다면, **원본 기사 URL이 외부에 살아 있는지**가 중요하다. AI는 자사 사이트의 자기 주장보다 제3자 기사를 신뢰한다

---

## 11.6 한국 시장 특수성

- **네이버 Cue: / 네이버 AI 검색** — 네이버 AI는 주로 **네이버 생태계 내 콘텐츠**(블로그·지식iN·뉴스·카페)에서 답을 구성한다. 자사 홈페이지만 최적화해도 네이버 AI 답변에는 거의 안 잡힌다. 네이버 공식 블로그 운영이 사실상 필수다
- **카카오** — 채널 정보 정비
- **언어별 분리** — GEO도 언어별로 다르게 작동한다. 영문 AI 답변에 잡히려면 en 콘텐츠가 기계번역이 아닌 실제 영어 문서여야 한다 (§4 원칙과 동일)

---

## 11.7 측정 — 정직하게 말하면 어렵다

Search Console 같은 도구가 없다. 현실적 방법:

**(a) 서버 로그에서 AI 크롤러 방문 확인** — 가장 객관적인 신호

```bash
# nginx access log (docs/deployment.md의 경로 기준)
grep -icE 'GPTBot|ClaudeBot|Claude-User|PerplexityBot|OAI-SearchBot|CCBot' /var/log/nginx/access.log
```

**(b) 리퍼러 트래픽** — `chatgpt.com`, `perplexity.ai`, `claude.ai`에서 오는 유입. GA4 도입 시 별도 세그먼트로 분리. **AI 경유 유입은 이미 답을 얻고 오므로 전환율이 일반 검색보다 높은 경향**이 있다

**(c) 수동 프롬프트 테스트** — 월 1회, 고정된 질문 세트로 언급 여부 기록:

```
"국내 ESS 솔루션 업체 추천"
"공장 피크저감 ESS 도입 방법"
"BEMS 구축 업체 비교"
"나인와트는 어떤 회사인가"
```

ChatGPT·Perplexity·Claude·Gemini 4개 엔진 × 4개 질문 = 16칸 스프레드시트. 언급/미언급과 인용된 URL을 기록하면 추세가 보인다. 투박하지만 현재로선 이게 가장 실용적이다.

---

## 11.8 GEO 관점 실행 순서 조정

기존 §10 순서에 GEO를 반영하면:

```
1주차  §1 등록 + §3 배관 + §11.2 AI 크롤러 정책 결정
       + §11.3(a) /llms.txt  ← 30분, 기존 자산 즉시 활용

2주차  §2 중복 해소 + §7 클라이언트 렌더링 전환  ← GEO 사유로 P0 승격
       + §11.3(b) /company 본문 강화

3–4주차 §6 JSON-LD (P1 승격) + §11.4 FAQ 페이지  ← GEO/SEO 동시 효과
       + §4 문안 1차

5–6주차 §11.4 제품 페이지 본문 재구조화 (질문형 소제목 + 직답)
       + §4 문안 2·3차

이후    §11.5 엔티티 일관성, §11.6 네이버 블로그, §8 서브도메인
```

**GEO 때문에 바뀌는 것은 결국 두 가지다**: §7이 P0로 올라가고, §11.4(인용 가능한 본문 + FAQ)라는 신규 작업이 생긴다. 나머지는 기존 SEO 계획이 대부분 커버한다.
