import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

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
      if (!rest.startsWith("/energy")) {
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
