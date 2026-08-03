import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * energy.ninewatt.com 에서 /energy 로 재작성하지 않고 그대로 통과시킬 경로.
 *
 * 이 서브도메인은 /ko/foo → /ko/energy/foo 로 재작성한다. 그런데 에너지
 * 헤더·푸터가 본 사이트의 제품 페이지(/product/*)를 링크하므로, 통과 목록이
 * 없으면 /ko/energy/product/bems 로 재작성되어 404가 난다.
 */
const ENERGY_HOST_PASSTHROUGH = [
  "/energy",
  "/product",
  "/solutions",
  "/company",
  "/contact",
];

/** 에너지 콘텐츠의 정식 호스트. src/lib/seo.ts의 ENERGY_SITE_URL과 같아야 한다 */
const ENERGY_HOST = "energy.ninewatt.com";

/**
 * /[locale]/energy/* 를 정식 호스트로 301 보낼 호스트.
 *
 * 프로덕션 메인 도메인만 넣는다. localhost·*.vercel.app 프리뷰까지 튕기면
 * 에너지 페이지를 로컬에서 열 수 없고 프리뷰 배포 검증도 불가능해진다.
 * 로컬에서 서브도메인 동작을 보려면 energy.localhost:3000 으로 접속할 것.
 */
const MAIN_PRODUCTION_HOSTS = new Set(["ninewatt.com", "www.ninewatt.com"]);

const LOCALE_ENERGY_PATH = /^\/(ko|en|ja|fr)\/energy(\/|$)/;

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // energy.ninewatt.com → /[locale]/energy/...
  if (host.startsWith("energy.")) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    const localePattern = /^\/(ko|en|ja|fr)(\/|$)/;
    const match = pathname.match(localePattern);

    if (match) {
      const locale = match[1];
      const rest = pathname.slice(locale.length + 1); // remove /ko
      const isPassthrough = ENERGY_HOST_PASSTHROUGH.some((p) =>
        rest === p || rest.startsWith(`${p}/`),
      );
      if (!isPassthrough) {
        url.pathname = `/${locale}/energy${rest || ""}`;
        return NextResponse.rewrite(url);
      }
    } else {
      url.pathname = `/ko/energy${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // solar.ninewatt.com → energy.ninewatt.com (301 redirect)
  if (host.startsWith("solar.")) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    const localePattern = /^\/(ko|en|ja|fr)(\/|$)/;
    const match = pathname.match(localePattern);

    if (match) {
      const locale = match[1];
      const rest = pathname.slice(locale.length + 1);
      // Map /ko/solar/... → /ko/energy/solar/...
      // Map /ko/services → /ko/energy/solar/services
      if (rest.startsWith("/solar")) {
        url.pathname = `/${locale}/energy${rest}`;
      } else {
        url.pathname = `/${locale}/energy/solar${rest || ""}`;
      }
    } else {
      url.pathname = `/ko/energy/solar${pathname === "/" ? "" : pathname}`;
    }

    url.host = host.replace("solar.", "energy.");
    return NextResponse.redirect(url, 301);
  }

  // ninewatt.com/[locale]/energy/* → energy.ninewatt.com/[locale]/energy/* (301)
  //
  // 같은 콘텐츠가 두 호스트에서 200을 반환하던 것을 정리한다. canonical만으로도
  // 구글은 통합하지만, 301은 링크 가치까지 정식 호스트로 넘긴다.
  // 경로는 유지한다 — /energy 접두사를 벗기면 next.config의 /solar 리다이렉트와
  // 충돌해 리다이렉트가 한 번 더 겹친다(자세한 배경은 src/lib/seo.ts 참조).
  //
  // /[locale]/energy/products/* 는 next.config에서 /[locale]/product/* 로 먼저
  // 빠지므로 여기 도달하지 않는다 — 제품 페이지는 메인 도메인이 정식이다.
  if (
    MAIN_PRODUCTION_HOSTS.has(host.split(":")[0]) &&
    LOCALE_ENERGY_PATH.test(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = ENERGY_HOST;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ko|en|ja|fr)/:path*", "/solar/:path*", "/energy/:path*"],
};
