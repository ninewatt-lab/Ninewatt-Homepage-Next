# SEO · GEO 실행 계획 (6주)

> 작성일: 2026-07-31 · 근거·상세 설명: [seo-improvement-plan.md](./seo-improvement-plan.md)
> 이 문서는 **무엇을 언제 할지**만 다룬다. 왜 하는지는 위 문서 참조.

## 확정된 결정

| 항목 | 결정 | 영향 |
|---|---|---|
| 기준 도메인 | **`https://ninewatt.com`** (apex 정식, `www` → apex 301) | canonical·sitemap 전체 |
| 제품 중복 경로 | **`/product/*` 정식** — `/energy/products/*` 5개는 301 후 파일 삭제 | Sprint 2 |
| AI 크롤러 | **전면 허용** — 학습·인용 모두 | `robots.ts` 단순화 |
| 투입 리소스 | 주 2–3일 (약 15 작업일 / 6주) | 아래 배분 |

## 투입 배분

```
Sprint 0  0.5일   검색엔진 등록                    (판단 불필요, 즉시)
Sprint 1  3.0일   메타데이터 배관                  ← 전체 효과의 절반
Sprint 2  2.5일   중복 해소 + 렌더링 전환
Sprint 3  2.5일   GEO 기반 (llms.txt, JSON-LD)
Sprint 4  4.0일   콘텐츠 (문안 1차, FAQ, OG)
Sprint 5  2.5일   본문 재구조화 착수
─────────────────
         15.0일
```

## 의존 관계

```
Sprint 0 (등록) ─────────────────────────┐
                                         ├─→ 색인 반영 대기 (2~4주, 병렬 진행)
Sprint 1 (배관) ──┬─→ Sprint 3 (JSON-LD)─┘
                  │
Sprint 2 (중복) ──┴─→ sitemap 확정 ──→ 콘솔 재제출
                  │
                  └─→ Sprint 4 (문안) ──→ Sprint 5 (본문)
```

Sprint 0은 다른 것과 **완전 독립**이므로 가장 먼저, 가장 빨리 끝낼 것. 색인 반영에 2~4주 걸리므로 등록이 늦으면 전체 일정이 그만큼 밀린다.

---

# 현황 실측치 (2026-07-31 기준)

계획 수립을 위해 집계한 실제 수치. Sprint 1·4의 공수 근거다.

| 항목 | 수치 |
|---|---|
| 총 페이지 | 45 (× 4 언어 = 180 URL) |
| `generateMetadata` 있음 | **29 / 45** |
| `generateMetadata` 없음 | **16** — 이 중 5개는 죽은 `/solar/*`, 10개는 `/energy/*`, **1개는 홈페이지 자체** |
| 하드코딩 영문 title (4언어 동일) | **12** |
| i18n `t()` 사용 title | 16 |
| `metadataBase`·canonical·hreflang | **0** |
| JSON-LD | **0** |

### 여기서 나온 추가 발견 4건

1. **홈페이지에 `generateMetadata`가 없다.** [`(main)/page.tsx`](../src/app/[locale]/\(main\)/page.tsx)가 레이아웃의 제네릭 값(`"Ninewatt 공식 홈페이지"`)을 그대로 쓴다. **가장 중요한 페이지가 가장 약한 메타데이터를 갖고 있다.** Sprint 1에서 최우선.

2. **`/energy/*` 10개 페이지 전체가 페이지별 메타데이터 없음.** 40개 URL(10 × 4언어)이 동일한 제네릭 title·description을 공유한다. Search Console이 중복 경고로 잡을 항목.

3. **[`/solutions/rnd`](../src/app/[locale]/\(main\)/solutions/rnd/page.tsx)의 title이 `"R&D 과제 - Ninewatt"` 한국어 하드코딩이다.** en·ja·fr 사용자와 해외 검색결과에 한국어가 그대로 노출된다. 사용자 눈에 보이는 버그. Sprint 1에서 함께 처리.

4. **`/energy/*` 는 한국어 번역만 존재한다.** `solar.json`·`energy.json`·`ess.json`이 `src/messages/ko`에만 있고, [request.ts](../src/i18n/request.ts)가 en·ja·fr을 ko로 폴백한다. 게다가 [`/energy/ppa`](../src/app/[locale]/energy/ppa/page.tsx)는 363줄 전체가 한국어 하드코딩이다(`t()` 호출 0건).

   즉 `/en/energy/ess` 같은 URL은 **영어 URL로 한국어 본문을 서빙한다.** 여기에 `hreflang="en"`을 선언하면 실제 언어와 불일치해 **hreflang 클러스터 전체가 무효화**되므로, 해당 라우트는 ko만 색인 대상으로 두고 en·ja·fr 변형에 `noindex`를 부여했다. 번역이 추가되면 [`src/lib/seo.ts`](../src/lib/seo.ts)의 `ROUTES`에서 해당 항목의 `locales` 한 줄만 지우면 된다.

   → **sitemap URL 수가 계획의 180개가 아니라 110개다** (전체 로케일 25 라우트 × 4 + ko 전용 10). 이게 정확한 수치다.

> 참고: `/energy/products/*` 5개의 title이 `/product/*` 5개와 **문자열까지 완전히 동일**하다. 중복 콘텐츠가 메타데이터 층에서도 확인된다 (Sprint 2에서 해소).
>
> 참고: 한국어 `common.metadata.description`이 `"Ninewatt 공식 홈페이지"`인데, en·ja·fr은 이미 `"AI-powered building energy analytics and optimization platform"` 수준으로 작성되어 있다. **주력 시장인 한국어 문안이 4개 언어 중 가장 부실하다.** Sprint 4-1에서 한국어를 최우선으로 다룰 것.

---

# Sprint 0 — 검색엔진 등록 (0.5일)

**코드 작업 없음. 가장 먼저 끝낼 것.** 색인 반영 지연이 전체 일정의 임계 경로다.

### 0-1. Google Search Console

**속성 유형에 따라 확인 방식이 갈린다.** 이걸 먼저 이해해야 헛수고를 피한다.

| 속성 유형 | 확인 방식 | 커버 범위 | 코드 작업 |
|---|---|---|---|
| **도메인 속성** (권장) | **DNS TXT만** | `ninewatt.com` + 모든 서브도메인 + http/https | **없음** |
| URL 접두어 속성 | HTML 태그, 파일 업로드, GA, GTM, DNS | 입력한 URL 접두어만 | HTML 태그 선택 시 env 필요 |

- [ ] **도메인 속성으로 등록** — https://search.google.com/search-console → 속성 추가 → **도메인**
  1. `ninewatt.com` 입력 (`https://`·`www` 없이 도메인만)
  2. 화면에 `google-site-verification=xxxxx` 형태의 TXT 값이 나온다
  3. Cloudflare DNS → `ninewatt.com` → DNS → 레코드 추가
     - 유형 `TXT` / 이름 `@` (또는 `ninewatt.com`) / 내용은 표시된 값 전체
     - **Proxy 설정과 무관** (TXT는 프록시 대상이 아님)
  4. 전파 확인 후 "확인" 클릭
     ```bash
     dig ninewatt.com TXT +short | grep google-site-verification
     ```

> **도메인 속성을 쓰면 `GOOGLE_SITE_VERIFICATION`은 필요 없다.** 도메인 속성은 HTML 태그 방식을 제공하지 않는다.
> 서브도메인(`energy.ninewatt.com`)까지 한 번에 커버되므로 이쪽이 유리하다.
> DNS 접근이 어렵거나 URL 접두어 속성을 따로 만들 때만 HTML 태그 방식을 쓰고, 그때 env를 채운다.

### 0-2. 네이버 서치어드바이저 — **여기는 HTML 태그가 필요하다**

네이버는 DNS 확인을 제공하지 않는다. HTML 태그 또는 HTML 파일 업로드뿐이므로 **`NAVER_SITE_VERIFICATION`은 실제로 쓰인다.**

- [ ] https://searchadvisor.naver.com → 웹마스터도구 → 사이트 등록
  1. `https://ninewatt.com` 입력
  2. 소유확인 방법에서 **HTML 태그** 선택
  3. 표시된 태그에서 **`content` 값만** 복사
     ```html
     <meta name="naver-site-verification" content="이_문자열만_복사" />
     ```
  4. `.env.local`(로컬) 및 배포 환경에 `NAVER_SITE_VERIFICATION=<값>` 설정
  5. 재배포 후 확인 → 소유확인 클릭
     ```bash
     curl -s https://ninewatt.com/ko | grep naver-site-verification
     ```
- [ ] 등록 후 **웹마스터도구 > 요청 > 사이트맵 제출**에 `https://ninewatt.com/sitemap.xml`

### 0-2.5. 🚨 Cloudflare가 AI 크롤러를 차단하고 있다 (2026-08-02 발견)

**"AI 크롤러 전면 허용" 결정과 정면으로 배치되는 상태가 이미 운영 중이다.**

`https://ninewatt.com/robots.txt`를 GET하면 origin이 아니라 **Cloudflare가 주입한 관리형 robots.txt**가 200/`text/plain`으로 응답한다:

```
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: ClaudeBot          Disallow: /
User-agent: GPTBot             Disallow: /
User-agent: CCBot              Disallow: /
User-agent: Google-Extended     Disallow: /
User-agent: Applebot-Extended   Disallow: /
User-agent: Amazonbot           Disallow: /
User-agent: Bytespider          Disallow: /
User-agent: meta-externalagent  Disallow: /
```

apex·`www`·`energy` 서브도메인 **전부** 동일하게 적용되고 있다.

**영향**: §11의 GEO 작업 전체가 CDN 층에서 무력화된다. Sprint 3의 `/llms.txt`를 만들어도 ClaudeBot·GPTBot이 접근할 수 없다. GEO를 하기로 했다면 이걸 먼저 풀어야 하고, 안 풀 거면 Sprint 3·5의 GEO 항목은 진행할 이유가 없다.

- [ ] **결정 재확인** — 학습(`ai-train`)까지 허용할지, 인용만 허용할지
- [ ] Cloudflare 대시보드 → `ninewatt.com` → **AI Crawl Control**(구 AI Audit) 또는 **보안 > 봇** → 관리형 `robots.txt` / Content Signals 정책 해제
  - 메뉴명은 Cloudflare가 자주 바꾸므로 "robots.txt" 또는 "AI" 키워드로 찾을 것
- [ ] 해제 후 재확인
  ```bash
  curl -s https://ninewatt.com/robots.txt | grep -E "GPTBot|ClaudeBot|Content-Signal"   # 결과 없어야 정상
  ```
- [ ] **Sprint 1 배포 후 재검증** — origin의 [`robots.ts`](../src/app/robots.ts)가 Cloudflare 관리형과 병합되는지 대체되는지 확인 필요

> 참고: 현재 `HEAD /robots.txt`는 404(origin), `GET`은 200(Cloudflare)로 응답이 갈린다.
> 크롤러는 GET을 쓰므로 위 차단이 **실제로 적용되고 있다.** Sprint 1 배포로 origin이 200을 반환하면 이 불일치는 해소된다.

### 0-3. Bing Webmaster Tools

- [ ] https://www.bing.com/webmasters → **Search Console에서 가져오기** (별도 확인 불필요)
- Copilot 노출이 Bing 색인 기반이므로 해외·AI 노출 대비로 의미가 있다

### 0-4. 환경변수 반영

`.env.example`을 복사해 `.env.local`을 만들고 값을 채운다. **모두 서버 전용 변수(런타임 로드)라 값만 바꾸고 재시작하면 되고, 재빌드는 필요 없다.**

```
NAVER_SITE_VERIFICATION=...       # 네이버는 필수
GOOGLE_SITE_VERIFICATION=         # 도메인 속성 쓰면 빈 값으로 둘 것
```

- [ ] 배포 환경(Docker/PM2)에도 동일하게 주입 — `docker-compose.yml`의 `environment:` 또는 `env_file:`

> ⚠️ `NEXT_PUBLIC_` 접두어를 쓰면 안 된다. 그 변수는 **빌드 시점에 값이 인라인**되는데
> [Dockerfile](../Dockerfile)이 `RUN pnpm build`에 build-arg를 넘기지 않아 프로덕션에서 `undefined`가 박힌다.
> 런타임 env를 아무리 바꿔도 태그가 안 나온다.

**완료 기준**: 3개 콘솔에서 소유확인 통과. (sitemap 제출은 Sprint 1 배포 후)

---

# Sprint 1 — 메타데이터 배관 (3일)

전체 효과의 절반이 여기 있다. **판단 불필요, 순수 구현.**

### 1-1. 공통 헬퍼 (0.5일)

- [ ] `src/lib/seo.ts` 신규 — `SITE_URL` 상수 + `buildMetadata()` 함수
  - 구현 코드: [seo-improvement-plan.md §3.1](./seo-improvement-plan.md#31-공통-헬퍼-먼저-만들-것)
  - ⚠️ **canonical은 반드시 페이지별로.** 레이아웃에 넣으면 45개 전부 `/ko`로 잡혀 역효과

### 1-2. 루트 레이아웃 (0.25일)

- [ ] [`[locale]/layout.tsx`](../src/app/[locale]/layout.tsx) — `metadataBase`, `title.template`, `verification` 추가
  - `verification`은 레이아웃에 두는 게 맞다 (상속되어도 무해)
  - `alternates`는 **넣지 말 것** (1-1 경고 참조)

### 1-3. sitemap · robots (0.5일)

- [ ] `src/app/sitemap.ts` 신규 — 라우트 목록은 [§3.2](./seo-improvement-plan.md#32-sitemapts)
  - `/product/*` 정식 결정 반영 → `/energy/products/*` **제외**
  - 죽은 `/solar/*` **제외**
- [ ] `src/app/robots.ts` 신규 — AI 크롤러 전면 허용 결정 반영:
  ```ts
  rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }]
  ```
  (§11.2의 학습 차단 블록은 **넣지 않음** — 전면 허용 결정)

### 1-4. 페이지별 적용 (1.5일)

29개는 기존 `generateMetadata`를 `buildMetadata`로 교체, 11개는 신규 추가(죽은 `/solar/*` 5개는 Sprint 2에서 삭제하므로 제외).

우선순위 순으로:

- [ ] **홈** [`(main)/page.tsx`](../src/app/[locale]/\(main\)/page.tsx) — 신규 추가. 발견 #1
- [ ] **제품 8개** `/product/*` — 기존 교체
- [ ] **`/contact`** — 기존 교체
- [ ] **`/energy/*` 10개** — 전부 신규 추가. 발견 #2
- [ ] **솔루션 8개** — 기존 교체. `/solutions/rnd` 한국어 하드코딩 동시 수정 (발견 #3)
- [ ] **회사 7개** — 기존 교체
- [ ] 하드코딩 영문 title 12개를 i18n 키로 이관 (문안 자체는 Sprint 4에서 개선 — 여기서는 **구조만** 정리)

> 문안 품질과 구조를 분리하는 게 핵심이다. Sprint 1에서 기존 문구를 그대로 i18n 키로 옮기기만 하면, Sprint 4에서는 JSON 값만 고치면 된다. 두 작업을 섞으면 3일이 1주가 된다.

### 1-5. 검증 (0.25일)

- [ ] 빌드 후 확인
  ```bash
  pnpm build && pnpm start
  curl -s localhost:3000/sitemap.xml | grep -c '<url>'      # 라우트수 × 4와 일치?
  curl -s localhost:3000/robots.txt
  curl -s localhost:3000/ko/product/bems | grep -oE '<link rel="(canonical|alternate)"[^>]*>'
  ```
- [ ] **각 페이지 canonical이 자기 자신을 가리키는지** 샘플 5개 확인 (최대 함정)
- [ ] hreflang 4언어 + `x-default` 상호 참조 확인
- [ ] 배포 후 3개 콘솔에 `https://ninewatt.com/sitemap.xml` 제출

**완료 기준**: sitemap URL이 전부 존재하고, canonical·hreflang이 페이지별로 정확하며, 콘솔 제출 완료.

---

## ✅ Sprint 1 구현 완료 (2026-07-31)

### 만든 것

| 파일 | 내용 |
|---|---|
| [`src/lib/seo.ts`](../src/lib/seo.ts) (신규) | `SITE_URL`, `ROUTES` 레지스트리(35 라우트), `buildMetadata()`, `localesFor()`, `absoluteUrl()` |
| [`src/app/sitemap.ts`](../src/app/sitemap.ts) (신규) | `ROUTES` 기반 생성. `lastModified`는 의도적으로 생략 |
| [`src/app/robots.ts`](../src/app/robots.ts) (신규) | AI 크롤러 전면 허용, `/api/` 차단 |
| [`[locale]/layout.tsx`](../src/app/[locale]/layout.tsx) | `metadataBase`, `title.template`, `verification` 추가 |
| 메시지 23개 파일 | `meta` 블록 추가 — **470줄 순수 추가, 삭제 0줄** |
| 페이지 33개 | `buildMetadata()` 적용 (29개 교체 + 11개 신규, 죽은 `/solar/*` 제외) |
| `energy/{contact,solar/sites}/layout.tsx` (신규) | `"use client"` 페이지용. Sprint 2 전환 시 삭제 대상 |

### 검증 결과

```
빌드              성공 (/robots.txt, /sitemap.xml 라우트 생성)
lint              608건 → 608건 (변경 전후 동일, 신규 지적 0건)
sitemap URL       110개 (ko 35 / en 25 / ja 25 / fr 25)
  리다이렉트 경로 포함     0건
  /energy/products 포함   0건
canonical 자기 참조  110/110 통과 ← 최대 함정, 전수 검증
미번역 변형 noindex  30/30 정상 (en·ja·fr × energy 10 라우트)
ko energy index      5/5 정상
hreflang             전체 로케일 라우트 4개 + x-default(ko) / ko 전용 라우트 ko + x-default
```

발견 #1·#3도 함께 해소됐다. 홈페이지가 자체 메타데이터를 갖게 되고, `/en/solutions/rnd`의 title이 `"R&D 과제"`(한국어) → `"R&D Track Record"`로 바뀌었다.

### 구조 선택 두 가지

**문안 품질과 구조를 분리했다.** `meta` 블록의 초기값은 현재 동작을 그대로 복사한 것이다(하드코딩 영문 12개는 4개 로케일 동일). Sprint 4는 JSON 값만 고치면 되고 코드는 건드릴 필요가 없다.

**canonical은 레이아웃이 아니라 페이지에서 만든다.** 레이아웃에 `alternates`를 두면 하위 45페이지가 전부 상속받아 canonical이 레이아웃 경로로 고정된다. `buildMetadata()`를 페이지마다 호출하는 구조이고, 루트 레이아웃에는 그러지 말라는 주석을 남겼다.

### 남은 확인 사항

- [ ] **환경변수 등록** — Sprint 0에서 발급받은 값을 `.env` 및 배포 환경에 넣어야 확인 태그가 렌더된다. 미설정 시 태그를 아예 출력하지 않으므로(빈 태그 방지) 지금은 무해하다
  ```
  GOOGLE_SITE_VERIFICATION=...
  NAVER_SITE_VERIFICATION=...
  ```
- [ ] **OG 이미지 보류** — `/images/og-default.png`가 없어서 404를 광고하게 되므로 `OG_DEFAULT_IMAGE`를 `null`로 두고 `og:image`를 출력하지 않는다. `twitter:card`도 `summary`로 폴백. Sprint 4-3에서 이미지 제작 후 상수 한 줄만 채우면 활성화된다
- [ ] **`/energy/products/*` 는 손대지 않았다** — Sprint 2에서 301 후 삭제할 대상이라 그대로 뒀다. sitemap에서는 이미 제외됐지만 canonical이 없는 상태이므로, Sprint 2를 오래 미루면 중복 색인 위험이 남는다
- [ ] 배포 후 3개 콘솔에 `https://ninewatt.com/sitemap.xml` 제출

---

# Sprint 2 — 중복 해소 + 렌더링 전환 (2.5일)

### 2-1. `/energy/products/*` → `/product/*` 301 (1일)

- [ ] [`next.config.ts`](../next.config.ts) `redirects()`에 추가
  ```ts
  {
    source: "/:locale(ko|en|ja|fr)/energy/products/:slug*",
    destination: "/:locale/product/:slug*",
    permanent: true,
  }
  ```
- [ ] `src/app/[locale]/energy/products/` 디렉토리 **삭제** (5개 페이지)
- [ ] `/energy/*` 내부 링크가 `/energy/products/*`를 가리키는 곳을 `/product/*`로 수정
  ```bash
  grep -rn "energy/products" src/ --include="*.tsx" --include="*.ts" --include="*.json"
  ```
- [ ] 헤더·푸터·내비게이션 링크 확인

> 301은 **최소 1년 유지.** 기존 색인 자산이 이전되는 데 시간이 걸린다.

### 2-2. 죽은 `/solar/*` 삭제 (0.25일)

- [ ] `src/app/[locale]/solar/` 디렉토리 삭제 (page 5개 + layout)
  - `next.config.ts`의 `/solar` → `/energy/solar` 301 때문에 **애초에 렌더되지 않는 코드**
- [ ] 해당 301 규칙은 **유지** (삭제 금지)
- [ ] `pnpm build` 통과 확인

### 2-3. 클라이언트 렌더링 전환 (1.25일)

GEO 사유로 P3 → **P0 승격.** AI 크롤러는 JS를 거의 실행하지 않아 이 페이지들은 **AI 엔진에게 존재하지 않는다.**

- [ ] [`energy/solar/sites/page.tsx`](../src/app/[locale]/energy/solar/sites/page.tsx) — 발전소 목록을 서버 렌더로. 인터랙션(필터·지도)만 자식 클라이언트 컴포넌트로 분리
  - 부수 효과: "태양광 발전소" 롱테일 키워드 자산이 생긴다
- [ ] [`energy/contact/page.tsx`](../src/app/[locale]/energy/contact/page.tsx) — 안내 문구·연락처는 서버 렌더, 폼만 클라이언트
- [ ] (`solar/sites`·`solar/contact`는 2-2에서 삭제되므로 작업 불필요)

### 2-4. 정리

- [ ] `sitemap.ts` 갱신 확인 (2-1 결과 반영)
- [ ] 리다이렉트 실제 동작 확인
  ```bash
  curl -sI localhost:3000/ko/energy/products/bems | head -3   # 308/301 → /ko/product/bems
  ```
- [ ] Search Console에서 sitemap 재제출

**완료 기준**: 중복 URL 40개 소멸, 죽은 코드 제거, AI 크롤러가 읽을 수 있는 HTML로 전환.

---

# Sprint 3 — GEO 기반 (2.5일)

### 3-1. `/llms.txt` (0.25일)

기존 챗봇 지식베이스를 그대로 노출. **콘텐츠 작성 불필요.**

- [ ] `src/app/llms.txt/route.ts` 신규 — [`COMPANY_KNOWLEDGE`](../src/lib/chatbot/systemPrompt.ts) 재사용
  - 구현: [§11.3(a)](./seo-improvement-plan.md#해야-할-일--같은-데이터를-크롤-가능한-형태로-한-번-더-노출)
- [ ] `robots.txt`에서 접근 가능한지 확인

> 정직한 기대치: llms.txt는 제안 표준이고 주요 AI 제공사가 읽는다는 공식 확인이 없다. 30분 공수라 넣지만 **효과의 본체는 3-2·3-3이다.**

### 3-2. JSON-LD (1.25일)

- [ ] **Organization** — [`[locale]/layout.tsx`](../src/app/[locale]/layout.tsx)에 1회 렌더. 스키마: [§6.1](./seo-improvement-plan.md#61-organization-최우선--브랜드-지식패널)
  - ⚠️ 값은 [`Footer.tsx`](../src/components/Footer.tsx)의 실제 표기(대표자 KIM YOUNGROK·사업자등록번호·주소·연락처)와 **한 글자도 다르지 않게**. 불일치는 신뢰 신호를 깎는다
  - `src/data/companyInfo.ts`를 출처로 쓰면 자동 일치
- [ ] **Product** — 제품 8페이지. 가격 비공개면 `Offer` 대신 `PropertyValue`로 스펙만
- [ ] **BreadcrumbList** — 2단 이상 경로 전체
- [ ] Rich Results Test 통과 확인 (https://search.google.com/test/rich-results)

### 3-3. `/company` 본문 강화 (1일)

챗봇만 알고 있는 사실을 **HTML 본문으로** 끌어낸다. [`systemPrompt.ts`](../src/lib/chatbot/systemPrompt.ts)에 이미 작성된 내용:

```
30+ employees · 60+ delivered projects · 36+ patents · 96.81% YoY growth
인천 본사 / 서울 R&D 센터 / 일본·영국·프랑스·미국 진출
CES innovation awards
```

- [ ] 위 수치를 `/company` 본문에 반영 (`src/data/*`가 출처이므로 하드코딩 말고 데이터 참조)
- [ ] ⚠️ **수치 검증 먼저.** "96.81% YoY"·"36+ 특허"가 현재도 유효한지 확인. 근거 없는 수치는 표시광고법 리스크
- [ ] 회사 정의문 한 문장을 페이지 최상단에 — AI가 인용할 단위

**완료 기준**: Rich Results Test 통과, `/llms.txt` 응답, `/company`에 구체적 수치가 HTML로 존재.

---

# Sprint 4 — 콘텐츠 (4일)

여기서부터 **사업 판단이 들어간다.** 키워드 조사 없이 시작하지 말 것.

### 4-0. 키워드 조사 (0.5일) — 선행 필수

- [ ] 네이버 키워드도구 + 구글 키워드플래너로 검색량 확인
- [ ] [§4의 키워드 축 후보](./seo-improvement-plan.md#노려야-할-키워드-축-검증-필요) 검증 (공용ESS·피크저감·BEMS·기업PPA·PV모니터링)
- [ ] **롱테일 우선.** "ESS" 단일 키워드는 대기업과 경쟁해 승산이 낮다. "공장 피크저감 ESS 도입 비용" 쪽이 전환율도 높다
- [ ] 언어별로 별도 조사 (ko "피크저감" ↔ en "peak shaving" ↔ ja "ピークカット") — 기계번역 금지

### 4-1. 메타 문안 1차 — 전환 직결 10페이지 (1.5일)

홈 + 제품 8개 + `/contact`. 4언어 = 40개 문안.

- [ ] title 55자 이내, `핵심 키워드 | 브랜드` 순서
- [ ] description 150–160자, 키워드 나열이 아닌 **클릭할 이유**
- [ ] 45페이지 전부 고유해야 함 (중복은 콘솔 경고)
- [ ] 메시지 파일에 `metaTitle`·`metaDescription` 키 추가 (Sprint 1-4에서 구조는 이미 준비됨)
- [ ] 수치를 쓸 경우 **실측 검증된 값만**

### 4-2. FAQ 페이지 (1.5일)

**GEO·SEO 양쪽에 동시에 듣는 유일한 항목.** 투자 대비 효율 최상.

- [ ] 챗봇 [`QuickReplies`](../src/components/chatbot/QuickReplies.tsx)의 예상 질문 + 실제 대화 로그에서 상위 질문 추출
- [ ] `/faq` 신규 페이지 또는 제품 페이지 하단 섹션으로 발행 — **반드시 서버 렌더**
- [ ] `FAQPage` JSON-LD 부착
- [ ] 답변은 질문 직후 2–3문장 직답 (역피라미드). AI는 앞부분을 인용한다

### 4-3. OG 이미지 (0.5일)

- [ ] 1200×630px, 최소 `/images/og-default.png` 1장
- [ ] 또는 `ImageResponse`로 동적 생성 (`opengraph-image.tsx`) — 문안 변경 시 이미지 재작업 불필요
- [ ] 카카오·페이스북 디버거로 검증

**완료 기준**: 10페이지 문안 교체 완료, FAQ 발행 + 스키마 통과, 링크 공유 시 썸네일 표시.

---

# Sprint 5 — 본문 재구조화 착수 (2.5일)

GEO의 본체. AI 엔진은 페이지를 순위 매기지 않고 **문단을 추출해 인용**하므로, 각 문단이 문맥 없이 홀로 성립해야 한다.

- [ ] 제품 8페이지에 **질문형 소제목** 도입
  - ✗ "제품 특징" → ✓ "피크저감 ESS는 전기요금을 얼마나 줄이는가?"
- [ ] 각 소제목 직후 **2–3문장 직답** (결론을 마지막에 두면 인용되지 않는다)
- [ ] 각 제품 페이지 최상단에 **한 문장 정의문** ("공용ESS란 ~이다")
- [ ] 마케팅 수식어를 구체 수치로 교체
  - ✗ "혁신적인 AI 솔루션으로 비용 절감" → ✓ "2024년 인천 A공장 도입 후 월 기본요금 1,240만원 → 870만원"
  - ⚠️ 실측 데이터 확보가 선행 조건. 없으면 이 항목은 보류
- [ ] 제품 스펙 **비교표** 추가 (추출 난이도가 가장 낮은 형태)
- [ ] 성과 수치에 외부 출처 링크 — [`patents/page.tsx`](../src/app/[locale]/\(main\)/company/patents/page.tsx)가 Google Patents로 직접 링크하는 패턴이 이미 있다. 이 방식을 확대
- [ ] 메타 문안 2차 (솔루션 8 + 에너지 9)

**완료 기준**: 제품 8페이지가 질문형 구조 + 직답 + 표를 갖춤.

---

# 6주 이후 (별도 과제)

우선순위 순. 각각 별도 계획이 필요하다.

- [ ] **메타 문안 3차** — 회사 7페이지 + 잔여
- [ ] **네이버 공식 블로그 운영** — 네이버 AI는 주로 네이버 생태계 내 콘텐츠에서 답을 구성한다. 자사 홈페이지만 최적화해도 네이버 AI 답변에는 거의 안 잡힌다. **국내 리드가 목표면 사실상 필수**
- [ ] **엔티티 일관성** ([§11.5](./seo-improvement-plan.md#115-엔티티-일관성-오프사이트--코드-무관)) — NAP 표기 통일, Wikidata 등재, 산업 디렉토리, 언론 보도 원본 URL 관리
- [ ] **`energy.ninewatt.com` 서브도메인 전략** ([§8](./seo-improvement-plan.md#8-p3--서브도메인-전략-별도-과제)) — 도메인 권위 분산 문제. 먼저 실태 확인:
  ```bash
  curl -sI https://energy.ninewatt.com/ko | head -20
  ```
- [ ] **분석 도구 도입** — GA4 또는 Vercel Analytics. 현재 **분석 도구가 전무**해서 어떤 검색어가 문의로 이어지는지 알 수 없다. SEO 투자 판단 근거가 없는 상태

---

# 측정

### 주간 (Sprint 1 배포 이후)

| 지표 | 도구 |
|---|---|
| 색인된 페이지 수 | Search Console > 페이지 |
| 노출수·클릭수·CTR | Search Console > 실적 |
| 크롤 오류 | Search Console > 페이지 |

### 월간

| 지표 | 방법 |
|---|---|
| 키워드별 순위 | Search Console > 검색어 |
| Core Web Vitals | PageSpeed Insights |
| 네이버 노출 | 서치어드바이저 > 사이트 최적화 |
| **AI 크롤러 방문** | `grep -icE 'GPTBot\|ClaudeBot\|PerplexityBot\|OAI-SearchBot' /var/log/nginx/access.log` |
| **AI 엔진 언급률** | 고정 질문 4개 × 4엔진 수동 테스트 ([§11.7](./seo-improvement-plan.md#117-측정--정직하게-말하면-어렵다)) |

### 기대 시점 — 과소평가 금물

```
Sprint 1 배포     →  색인 반영 시작 2~4주 후
                  →  순위 변동 체감 1~2개월 후
                  →  순위 안정화 2~3개월 후
Sprint 2 301      →  기존 색인 자산 이전 1~3개월 (최대 6개월)
GEO 인용          →  측정 자체가 어렵고 변동성 큼. 3개월 단위로 볼 것
```

**6주 계획이 끝나는 시점에 트래픽 지표는 아직 거의 안 움직인다.** Sprint 1~2는 "구글이 볼 수 있게 만드는" 작업이고, 결과는 그 이후에 나온다. 이걸 전제로 기대치를 관리할 것.

---

# 리스크

| 리스크 | 영향 | 대응 |
|---|---|---|
| canonical을 레이아웃에 넣는 실수 | **치명적** — 45페이지가 전부 `/ko`로 canonical 선언, 색인 붕괴 | Sprint 1-5 검증 필수. 샘플 5개 육안 확인 |
| sitemap에 리다이렉트 URL 포함 | 감점 | Sprint 2 완료 후 sitemap 재확인 |
| `/energy/products/*` 링크 잔존 | 내부 301 체인 | `grep -rn "energy/products" src/` 로 전수 확인 |
| 근거 없는 성과 수치 게시 | **표시광고법 리스크** | Sprint 3-3·5에서 실측 검증 선행 |
| Footer와 JSON-LD 회사 정보 불일치 | 신뢰 신호 하락 | `src/data/companyInfo.ts` 단일 출처 사용 |
| 4언어 기계번역 | 해외 검색 노출 실패 | Sprint 4-0에서 언어별 키워드 조사 |

---

# 결정 대기 항목

계획 진행에 지장은 없지만 해당 Sprint 전까지 정해야 한다.

| 항목 | 필요 시점 | 결정권자 |
|---|---|---|
| 노릴 키워드 축 확정 | Sprint 4-0 | 마케팅/대표 |
| 게시 가능한 실측 성과 수치 | Sprint 3-3 | 사업팀 |
| OG 이미지 디자인 방향 | Sprint 4-3 | 디자인 |
| 네이버 블로그 운영 주체 | 6주 이후 | 마케팅 |
| `energy.ninewatt.com` 통합 여부 | 6주 이후 | 대표 |

---

# 즉시 시작 가능

**Sprint 0과 Sprint 1은 판단이 전혀 필요 없다.** 결정이 모두 확정됐고 순수 구현이다. 합쳐서 3.5일, 전체 효과의 절반 이상.

오늘 착수 순서:
1. Search Console·네이버 서치어드바이저 등록 (30분) — 색인 반영이 임계 경로이므로 이것부터
2. `src/lib/seo.ts` + `sitemap.ts` + `robots.ts` 생성
3. 홈페이지 `generateMetadata` 추가 (발견 #1 — 가장 중요한 페이지가 가장 약하다)
