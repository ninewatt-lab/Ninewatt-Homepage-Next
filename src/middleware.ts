import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // solar.ninewatt.com → rewrite to /solar path
  if (host.startsWith("solar.")) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // If not already on /solar path, rewrite
    // Check if path already starts with a locale prefix + /solar or just /solar
    const localePattern = /^\/(ko|en|ja|fr)(\/|$)/;
    const match = pathname.match(localePattern);

    if (match) {
      // e.g., /ko/something → /ko/solar/something
      const locale = match[1];
      const rest = pathname.slice(locale.length + 1); // remove /ko
      if (!rest.startsWith("/solar")) {
        url.pathname = `/${locale}/solar${rest || ""}`;
        return NextResponse.rewrite(url);
      }
    } else if (!pathname.startsWith("/solar")) {
      // No locale prefix, let intl middleware handle locale first
      // but prefix with /solar for after locale redirect
      url.pathname = `/solar${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ko|en|ja|fr)/:path*", "/solar/:path*"],
};
