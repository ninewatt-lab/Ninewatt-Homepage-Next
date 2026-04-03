import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (host.startsWith("solar.")) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    const localePattern = /^\/(ko|en|ja|fr)(\/|$)/;
    const match = pathname.match(localePattern);

    if (match) {
      // e.g., /ko → /ko/solar, /ko/services → /ko/solar/services
      const locale = match[1];
      const rest = pathname.slice(locale.length + 1); // remove /ko
      if (!rest.startsWith("/solar")) {
        url.pathname = `/${locale}/solar${rest || ""}`;
        return NextResponse.rewrite(url);
      }
    } else {
      // No locale prefix (e.g., "/" or "/services")
      // Redirect to /ko/solar (with locale)
      url.pathname = `/ko/solar${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ko|en|ja|fr)/:path*", "/solar/:path*"],
};
