import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = "https://ninewatt.com";

/**
 * 에너지 사업부의 정식 호스트.
 *
 * 경로는 그대로 두고 호스트만 바꾼다. /energy 접두사를 벗기면 안 된다 —
 * next.config.ts의 /:locale/solar → /:locale/energy/solar 리다이렉트가
 * middleware보다 먼저 실행되므로, 접두사 없는 주소(energy.ninewatt.com/ko/solar)는
 * 308로 되돌아온다. canonical이 리다이렉트되는 URL을 가리키면 무시될 수 있다.
 * 실제로 200을 반환하고 EnergyHeader가 링크하는 주소는 /ko/energy/solar 쪽이다.
 *
 * 여기를 SITE_URL로 되돌리면 서브도메인이 스스로를 중복으로 선언하게 되고,
 * 내부 링크가 향하는 URL과 색인 대상이 어긋난다.
 */
export const ENERGY_SITE_URL = "https://energy.ninewatt.com";

const ENERGY_PREFIX = "/energy";

export function isEnergyPath(path: string): boolean {
  return path === ENERGY_PREFIX || path.startsWith(`${ENERGY_PREFIX}/`);
}

/**
 * 요청 Host가 에너지 서브도메인인지. middleware의 판정과 같은 기준을 쓴다.
 * robots·sitemap이 호스트마다 자기 URL만 내보내도록 하는 데 쓴다.
 */
export function isEnergyHost(host: string | null | undefined): boolean {
  return (host ?? "").startsWith("energy.");
}

/** 내부 라우트 경로가 공개되는 호스트 */
export function siteUrlFor(path: string): string {
  return isEnergyPath(path) ? ENERGY_SITE_URL : SITE_URL;
}

/**
 * OG 기본 이미지 (1200×630).
 *
 * Sprint 4에서 제작 후 "/images/og-default.png" 형태로 지정한다.
 * 존재하지 않는 경로를 넣으면 카카오·페이스북이 404를 받아 미리보기 카드가
 * 깨진 상태로 노출되므로, 파일이 실제로 배포될 때까지 null로 둔다.
 */
export const OG_DEFAULT_IMAGE: string | null = null;

export type ChangeFreq = "weekly" | "monthly" | "yearly";

export type RouteDef = {
  /** 로케일 세그먼트를 제외한 경로. 홈은 "/" */
  path: string;
  priority: number;
  freq: ChangeFreq;
  /**
   * 실제 번역이 존재하는 로케일. 생략 시 routing.locales 전체.
   *
   * /energy/* 는 energy·ess·solar 네임스페이스에 의존하는데 이 세 파일은
   * src/messages/ko 에만 존재한다(request.ts가 en·ja·fr을 ko로 폴백).
   * /energy/ppa 는 본문이 한국어로 하드코딩되어 있다.
   * 따라서 해당 라우트는 ko만 색인 대상으로 두고, 번역이 추가되면 이 값을 지운다.
   * 실제 언어와 다른 hreflang을 선언하면 클러스터 전체가 무효화되므로 임의로 늘리지 말 것.
   */
  locales?: readonly string[];
};

const KO_ONLY = ["ko"] as const;

/**
 * sitemap과 hreflang의 단일 출처.
 *
 * 규칙:
 * - 리다이렉트되는 경로는 넣지 않는다 (/solar/* → /energy/solar/*)
 * - 중복 경로는 정식 쪽만 넣는다 (/product/* 정식, /energy/products/* 제외)
 * - priority는 사업 중요도 기준 수동 관리
 */
export const ROUTES: readonly RouteDef[] = [
  { path: "/", priority: 1.0, freq: "weekly" },

  // 제품 — 전환 직결
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

  // 회사 — 신뢰 신호
  { path: "/company", priority: 0.7, freq: "monthly" },
  { path: "/company/history", priority: 0.5, freq: "yearly" },
  { path: "/company/awards", priority: 0.6, freq: "monthly" },
  { path: "/company/patents", priority: 0.6, freq: "monthly" },
  { path: "/company/papers", priority: 0.6, freq: "monthly" },
  { path: "/company/media", priority: 0.7, freq: "weekly" },
  { path: "/company/career", priority: 0.7, freq: "weekly" },

  // 전환
  { path: "/contact", priority: 0.9, freq: "yearly" },

  // 에너지 사업부 — 한국어만 번역 존재 (위 locales 주석 참조)
  { path: "/energy", priority: 0.8, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/ess", priority: 0.8, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/ess/monitoring", priority: 0.6, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/ess/services", priority: 0.6, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/solar", priority: 0.8, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/solar/monitoring", priority: 0.6, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/solar/services", priority: 0.6, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/solar/sites", priority: 0.6, freq: "weekly", locales: KO_ONLY },
  { path: "/energy/ppa", priority: 0.8, freq: "monthly", locales: KO_ONLY },
  { path: "/energy/contact", priority: 0.7, freq: "yearly", locales: KO_ONLY },
];

const ROUTE_BY_PATH = new Map(ROUTES.map((r) => [r.path, r]));

/** 로케일 세그먼트를 포함한 상대 경로. 홈은 "/ko" */
export function localePath(locale: string, path: string): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

/** 공개 절대 URL. canonical·sitemap·JSON-LD용 */
export function absoluteUrl(locale: string, path: string): string {
  return `${siteUrlFor(path)}${localePath(locale, path)}`;
}

/** 해당 경로에 실제 번역이 존재하는 로케일 목록 */
export function localesFor(path: string): readonly string[] {
  return ROUTE_BY_PATH.get(path)?.locales ?? routing.locales;
}

export type BuildMetadataInput = {
  locale: string;
  /** ROUTES의 path와 일치해야 한다. 불일치 시 전체 로케일로 간주된다 */
  path: string;
  title: string;
  description: string;
  /** true면 부모 레이아웃의 title.template을 적용하지 않는다 (홈페이지 등) */
  absoluteTitle?: boolean;
  ogImage?: string;
};

/**
 * 페이지별 메타데이터 생성.
 *
 * canonical을 레이아웃이 아니라 페이지에서 만드는 이유:
 * 레이아웃에 alternates를 두면 모든 하위 페이지가 그 값을 상속해
 * 전 페이지의 canonical이 레이아웃 경로로 고정된다. 반드시 페이지 단위로 호출할 것.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  ogImage,
}: BuildMetadataInput): Metadata {
  const image = ogImage ?? OG_DEFAULT_IMAGE;
  const locales = localesFor(path);
  // 절대 URL로 발급한다. 상대 경로는 metadataBase(=SITE_URL)에 붙으므로
  // 에너지 페이지가 메인 도메인을 canonical로 선언해버린다.
  const url = absoluteUrl(locale, path);

  // 번역이 없는 로케일 변형은 색인에서 제외한다.
  // 한국어 본문을 /en/ 아래에서 영어로 선언하면 hreflang 클러스터가 무효화된다.
  const indexable = locales.includes(locale);

  const xDefault = locales.includes(routing.defaultLocale)
    ? routing.defaultLocale
    : locales[0];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(l, path)])),
        "x-default": absoluteUrl(xDefault, path),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Ninewatt",
      locale,
      url,
      title,
      description,
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      // 이미지가 없는 상태에서 summary_large_image를 쓰면 빈 카드로 렌더된다
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        }
      : { index: false, follow: true },
  };
}
