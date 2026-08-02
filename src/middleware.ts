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

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ko|en|ja|fr)/:path*", "/solar/:path*", "/energy/:path*"],
};
