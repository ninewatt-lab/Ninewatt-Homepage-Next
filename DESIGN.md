# DESIGN.md — Ninewatt Design System

이 문서는 나인와트 홈페이지의 디자인 시스템을 정의합니다.
모든 UI 작업은 이 문서를 기준으로 합니다.

## Brand Identity

- **회사명:** Ninewatt (나인와트)
- **포지셔닝:** AI 기반 에너지 기술 기업 — 프리미엄, 신뢰, 기술력
- **톤:** 따뜻한 전문성. 삼성/LG의 격식 + 스타트업의 접근성

## Color System

CSS 변수 기반. `src/app/globals.css`에 정의.

### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#3896A8` | 브랜드 틸. CTA, 링크, 강조 |
| `--primary-dark` | `#275E68` | hover 상태 |
| `--primary-light` | `#49B6CA` | hero-shine, 밝은 강조 |
| `--primary-50` | `#ECF6F8` | 배경 하이라이트 |
| `--accent` | `#307481` | 보조 강조 |
| `--background` | `#ffffff` | 페이지 배경 |
| `--foreground` | `#171717` | 본문 텍스트 |
| `--surface` | `#f5f7fa` | 카드/섹션 배경 |
| `--surface-elevated` | `#ffffff` | 올라온 표면 (입력 필드 등) |
| `--border` | `rgba(0,0,0,0.08)` | 테두리 |
| `--muted` | `#6b7280` | 보조 텍스트 |

### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#49B6CA` | 밝은 틸 (어두운 배경 대비) |
| `--primary-dark` | `#3896A8` | hover 상태 |
| `--primary-light` | `#85D2E0` | hero-shine, 밝은 강조 |
| `--background` | `#0a0a0f` | 페이지 배경 |
| `--foreground` | `#e5e7eb` | 본문 텍스트 |
| `--surface` | `#12121a` | 카드/섹션 배경 |
| `--surface-elevated` | `#1a1a26` | 올라온 표면 |
| `--border` | `rgba(255,255,255,0.08)` | 테두리 |
| `--muted` | `#9ca3af` | 보조 텍스트 |

### 금지 색상
- 보라/인디고 그라디언트 (AI 슬롭 패턴)
- 순수 검정 `#000000` (항상 `--background` 사용)

## Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| 본문 (한국어) | Pretendard Variable | 400 | base (14-16px) |
| 본문 (일본어) | Pretendard JP Variable | 400 | base |
| 제목 | Pretendard Variable | 700-800 | 2xl-7xl |
| 코드/수치 | Geist Mono | 600 | sm |
| 라벨 | Pretendard Variable | 600 | xs, uppercase, tracking-[0.2em] |

### 규칙
- `word-break: keep-all` — 한국어 텍스트 자연 줄바꿈
- 제목: `tracking-tight`, 본문: `leading-relaxed`
- 라벨: `text-xs font-semibold uppercase tracking-[0.2em] text-primary`

## Spacing

Tailwind 기본 스케일 사용. 커스텀 없음.

| Context | Pattern |
|---------|---------|
| 섹션 패딩 | `px-6 py-24` |
| 섹션 max-width | `max-w-5xl` ~ `max-w-7xl` |
| 카드 내부 | `p-8` |
| 요소 간격 | `gap-6` (기본), `gap-12`~`gap-16` (섹션 사이) |

## Components

### Buttons
- **Primary:** `rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark`
- **Secondary:** `rounded-full border border-border px-8 py-3 text-sm font-semibold hover:border-primary/30 hover:text-primary`
- **Ghost (Hero):** `rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:border-white/60 hover:bg-white/10`

### Cards
- `rounded-2xl border border-border p-8`
- hover: `hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5`
- 텍스트 hover: `group-hover:text-primary`

### Inputs
- `rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm`
- focus: `focus:border-primary`

## Animation

| Name | Pattern | Duration |
|------|---------|----------|
| scroll-reveal | `translateY(30px) → 0, opacity 0 → 1` | 0.7s ease-out |
| hero-fade-in | staggered `translateY(20px) → 0` | 0.8s ease, 0.2~1.5s delay |
| hero-shine | gradient background-position flow | 6s ease infinite |
| marquee | `translateX(0 → -100%)` | linear infinite |

### 규칙
- `prefers-reduced-motion: reduce` 존중 — 모든 애니메이션 비활성화
- 과도한 애니메이션 금지. 의미 있는 모션만.

## Solar Subsite Design

Solar 서브사이트(`/solar`)는 메인 사이트와 **의도적으로 다른** 디자인 언어를 사용합니다.

| 속성 | 메인 사이트 | Solar 서브사이트 |
|------|-----------|----------------|
| 주 색상 | Teal (#3896A8) | Zinc 팔레트 |
| 배경 | 라이트 기본 | 다크 기본 |
| 헤더 | 메가메뉴 | 단순 4항목 |
| 레이아웃 | Header + Footer (공통) | SolarHeader + SolarFooter (별도) |

Solar는 B2B 태양광 O&M 서비스 전용 서브사이트로, 메인 브랜드와 구분되는 전문적이고 기술적인 느낌을 의도합니다.

## Accessibility

- 글로벌 `focus-visible` 스타일: `outline: 2px solid var(--primary); outline-offset: 2px`
- 터치 타겟 최소 44px (padding으로 확장)
- `<nav aria-label="...">`, `<main>`, `<footer aria-label="...">` 사용
- 다크 모드에서 색상 대비 유지
