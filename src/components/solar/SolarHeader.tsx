"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NinewattLogo from "@/components/icons/NinewattLogo";

const navItems = [
  { href: "/solar", labelKey: "home" },
  { href: "/solar/services", labelKey: "services" },
  { href: "/solar/monitoring", labelKey: "monitoring" },
  { href: "/solar/sites", labelKey: "sites" },
];

export default function SolarHeader() {
  const t = useTranslations("solar.nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Only use transparent header on the solar home page (hero has background image)
  const isHome = pathname === "/solar" || pathname === "/solar/";
  const showSolid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSolid
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/solar" className="flex items-center gap-2">
            <NinewattLogo
              height={36}
              width="auto"
              className={showSolid ? "" : "[&_path]:fill-white"}
            />
            <span
              className={`text-sm font-semibold tracking-tight border-l pl-2 ml-0.5 ${
                showSolid
                  ? "text-primary border-zinc-300 dark:border-zinc-600"
                  : "text-white/90 border-white/30"
              }`}
            >
              Solar
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showSolid
                    ? "text-zinc-600 dark:text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <Link
              href="/solar/contact"
              className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              {t("contact")}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 ${showSolid ? "text-zinc-600 dark:text-zinc-400" : "text-white"}`}
            aria-label="메뉴"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
