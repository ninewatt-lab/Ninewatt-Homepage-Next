"use client";

import { Link } from "@/i18n/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "./ThemeProvider";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import NinewattLogo from "./icons/NinewattLogo";

/* ──────────────────────────────────────────────
   Navigation data with sub-items
   ────────────────────────────────────────────── */

interface NavSubItem {
  href: string;
  labelKey: string;
  descKey: string;
  icon: React.ReactNode;
}

interface NavSection {
  titleKey?: string;
  items: NavSubItem[];
}

interface NavItemWithChildren {
  href: string;
  labelKey: string;
  viewAllKey: string;
  menuNamespace: string;
  sections: NavSection[];
}

const productNav: NavItemWithChildren = {
  href: "/product",
  labelKey: "nav.product",
  viewAllKey: "nav.viewAllProduct",
  menuNamespace: "productMenu",
  sections: [
    {
      titleKey: "productMenu.platform",
      items: [
        {
          href: "/product/opti",
          labelKey: "Opti",
          descKey: "productMenu.optiDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z" />
              <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          ),
        },
        {
          href: "/product/watti",
          labelKey: "Watti",
          descKey: "productMenu.wattiDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M12 3L2 9l10 6 10-6-10-6z" /><path d="M2 17l10 6 10-6" /><path d="M2 13l10 6 10-6" />
            </svg>
          ),
        },
        {
          href: "/product/save-e",
          labelKey: "Save-E",
          descKey: "productMenu.saveEDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          ),
        },
      ],
    },
    {
      titleKey: "productMenu.appsAndServices",
      items: [
        {
          href: "/product/greenplanner",
          labelKey: "GreenPlanner",
          descKey: "productMenu.greenplannerDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M17 8C17 5.24 14.76 3 12 3S7 5.24 7 8c0 3.53 5 9 5 9s5-5.47 5-9z" />
              <path d="M12 11V8m0 0l-1.5 1.5M12 8l1.5 1.5" />
              <path d="M5 21h14" />
            </svg>
          ),
        },
        {
          href: "/product/repark",
          labelKey: "RE:park",
          descKey: "productMenu.reparkDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
          ),
        },
        {
          href: "/product/solar-site",
          labelKey: "SolarScope",
          descKey: "productMenu.solarScopeDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2m-8.66-3.34l1.42-1.42m12.48-12.48l1.42-1.42M1 12h2m18 0h2m-3.34 8.66l-1.42-1.42M4.76 4.76L3.34 3.34" />
            </svg>
          ),
        },
        {
          href: "/product/pv-intelligence",
          labelKey: "PV Intelligence",
          descKey: "productMenu.pvIntelligenceDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M2 12h4l3-9 6 18 3-9h4" />
            </svg>
          ),
        },
      ],
    },
  ],
};

const solutionsNav: NavItemWithChildren = {
  href: "/solutions",
  labelKey: "nav.solutions",
  viewAllKey: "nav.viewAllSolutions",
  menuNamespace: "solutionsMenu",
  sections: [
    {
      titleKey: "solutionsMenu.capabilities",
      items: [
        {
          href: "/solutions",
          labelKey: "solutionsMenu.coreSolutions",
          descKey: "solutionsMenu.coreSolutionsDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v4m0 14v4m-8.66-15l3.46 2m10.4 6l3.46 2M1.34 15l3.46-2m10.4-6l3.46-2M1.34 9l3.46 2m10.4 6l3.46 2m-14.32 0l3.46-2m10.4-6l3.46-2" />
            </svg>
          ),
        },
      ],
    },
    {
      titleKey: "solutionsMenu.trackRecord",
      items: [
        {
          href: "/solutions/cases",
          labelKey: "solutionsMenu.cases",
          descKey: "solutionsMenu.casesDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          ),
        },
        {
          href: "/solutions/rnd",
          labelKey: "solutionsMenu.rnd",
          descKey: "solutionsMenu.rndDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/solutions/services",
          labelKey: "solutionsMenu.services",
          descKey: "solutionsMenu.servicesDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          ),
        },
      ],
    },
  ],
};

const companyNav: NavItemWithChildren = {
  href: "/company",
  labelKey: "nav.company",
  viewAllKey: "nav.viewAllCompany",
  menuNamespace: "companyMenu",
  sections: [
    {
      titleKey: "companyMenu.about",
      items: [
        {
          href: "/company",
          labelKey: "companyMenu.companyIntro",
          descKey: "companyMenu.companyIntroDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
            </svg>
          ),
        },
        {
          href: "/company/history",
          labelKey: "companyMenu.history",
          descKey: "companyMenu.historyDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        },
        {
          href: "/company/career",
          labelKey: "companyMenu.career",
          descKey: "companyMenu.careerDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          ),
        },
      ],
    },
    {
      titleKey: "companyMenu.achievements",
      items: [
        {
          href: "/company/global",
          labelKey: "companyMenu.global",
          descKey: "companyMenu.globalDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          ),
        },
        {
          href: "/company/awards",
          labelKey: "companyMenu.awards",
          descKey: "companyMenu.awardsDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M8 21h8m-4-4v4m-4.5-9.25L7 8.5V3h10v5.5l-.5 3.25" />
              <path d="M5 3h14" /><path d="M7 8.5H5a2 2 0 00-2 2c0 2.5 2 4 4 4.5m10-6.5h2a2 2 0 012 2c0 2.5-2 4-4 4.5" />
            </svg>
          ),
        },
        {
          href: "/company/patents",
          labelKey: "companyMenu.patents",
          descKey: "companyMenu.patentsDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M12 2L9 9H2l5.5 4.5L5 21l7-5 7 5-2.5-7.5L22 9h-7L12 2z" />
            </svg>
          ),
        },
        {
          href: "/company/media",
          labelKey: "companyMenu.media",
          descKey: "companyMenu.mediaDesc",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
              <path d="M10 9l5 3-5 3V9z" />
            </svg>
          ),
        },
      ],
    },
  ],
};

const megaMenuItems: NavItemWithChildren[] = [productNav, solutionsNav, companyNav];

const localeLabels: Record<string, { short: string; native: string }> = {
  ko: { short: "KO", native: "한국어" },
  en: { short: "EN", native: "English" },
  ja: { short: "JA", native: "日本語" },
  fr: { short: "FR", native: "Français" },
};

/* ──────────────────────────────────────────────
   Header Component
   ────────────────────────────────────────────── */

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchMenuRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Track mouse positions for trajectory-based intent detection
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const positions = mousePosRef.current;
      positions.push({ x: e.clientX, y: e.clientY, t: now });
      // Keep only last 150ms of positions
      while (positions.length > 1 && now - positions[0].t > 150) {
        positions.shift();
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Check if mouse trajectory is aimed toward the dropdown area
  const isMovingTowardDropdown = useCallback(() => {
    const positions = mousePosRef.current;
    if (positions.length < 2) return false;

    const oldest = positions[0];
    const latest = positions[positions.length - 1];
    const dy = latest.y - oldest.y;
    const dx = Math.abs(latest.x - oldest.x);

    // Moving downward and the downward component is significant relative to horizontal
    return dy > 3 && dy > dx * 0.4;
  }, []);

  const handleMouseEnter = useCallback((label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (switchMenuRef.current) clearTimeout(switchMenuRef.current);

    // If a dropdown is already open and user enters a different button,
    // check if they're moving toward the dropdown (diagonal motion)
    if (activeMenu && activeMenu !== label) {
      if (isMovingTowardDropdown()) {
        // Moving toward dropdown — delay and re-check
        switchMenuRef.current = setTimeout(() => {
          // After delay, if still on this button it's intentional
          setActiveMenu(label);
        }, 300);
        return;
      }
    }
    setActiveMenu(label);
  }, [activeMenu, isMovingTowardDropdown]);

  const handleMouseLeave = useCallback(() => {
    if (switchMenuRef.current) clearTimeout(switchMenuRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  }, []);

  const handleDropdownEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (switchMenuRef.current) clearTimeout(switchMenuRef.current);
  }, []);

  const switchLocale = useCallback((newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "ko" | "en" | "ja" | "fr" });
    setLangOpen(false);
  }, [router, pathname]);

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !mobileOpen && !activeMenu;

  // Helper to resolve label — product names are literal, others are translation keys
  const resolveLabel = (key: string) => {
    // Product names stay as-is
    if (!key.includes(".")) return key;
    return t(key);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 z-50 w-full transition-all duration-200 ${
          activeMenu
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg shadow-black/5"
            : scrolled || mobileOpen
              ? "bg-background/80 border-b border-border backdrop-blur-xl"
              : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className={`transition-colors ${isTransparent ? "text-white" : "text-foreground"}`}>
            <NinewattLogo height={36} width="auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {megaMenuItems.map((item) => (
              <div
                key={item.labelKey}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.labelKey)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeMenu === item.labelKey
                      ? "text-foreground bg-surface"
                      : isTransparent
                        ? "text-white/80 hover:text-white"
                        : "text-muted hover:text-foreground"
                  }`}
                >
                  {t(item.labelKey)}
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`h-3 w-3 transition-transform duration-200 ${
                      activeMenu === item.labelKey ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </Link>
              </div>
            ))}

            <div className="ml-4 flex items-center gap-3">
              {/* Language Switcher */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition-colors ${isTransparent ? "text-white/80 hover:text-white" : "text-muted hover:text-foreground"}`}
                >
                  {localeLabels[locale].short}
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`}>
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                    {routing.locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`flex w-full items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs transition-colors hover:bg-surface ${locale === loc ? "font-semibold text-primary" : "text-muted"}`}
                      >
                        {localeLabels[loc].native}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isTransparent ? "text-white/80 hover:text-white" : "text-muted hover:text-foreground"}`}
                aria-label={t("nav.themeToggle")}
              >
                {theme === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <Link
                href="/contact"
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </nav>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isTransparent ? "text-white/80 hover:text-white" : "text-muted hover:text-foreground"}`}
              aria-label={t("nav.themeToggle")}
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="flex flex-col gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("nav.menu")}
            >
              <span className={`block h-0.5 w-6 transition-transform ${isTransparent ? "bg-white" : "bg-foreground"} ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 transition-opacity ${isTransparent ? "bg-white" : "bg-foreground"} ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 transition-transform ${isTransparent ? "bg-white" : "bg-foreground"} ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Desktop Mega Menu Dropdown ── */}
        <div
          className={`hidden lg:block absolute left-0 w-full transition-[clip-path] duration-200 ease-out ${
            activeMenu
              ? "[clip-path:inset(0)] pointer-events-auto"
              : "[clip-path:inset(0_0_100%_0)] pointer-events-none"
          }`}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-background/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="grid *:col-start-1 *:row-start-1">
              {megaMenuItems.map((item) => (
                <div
                  key={item.labelKey}
                  className={`transition-opacity duration-200 ${
                    activeMenu === item.labelKey
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex">
                    {item.sections.map((section, sIdx) => (
                      <div
                        key={sIdx}
                        className={`w-72 shrink-0 pr-10 ${
                          sIdx < item.sections.length - 1
                            ? "mr-10 border-r border-border"
                            : ""
                        }`}
                      >
                        {section.titleKey && (
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted/70">
                            {t(section.titleKey)}
                          </h3>
                        )}
                        <div className="flex flex-col gap-1">
                          {section.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setActiveMenu(null)}
                              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface"
                            >
                              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                {subItem.icon}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                                  {resolveLabel(subItem.labelKey)}
                                  <svg
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                                  >
                                    <path d="M4 2L8 6L4 10" />
                                  </svg>
                                </span>
                                <span className="text-xs leading-relaxed text-muted">
                                  {t(subItem.descKey)}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Right side: Overview link with divider */}
                    <div className="ml-auto flex items-start border-l border-border pl-10 pt-3">
                      <Link
                        href={item.href}
                        onClick={() => setActiveMenu(null)}
                        className="group inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        {t(item.viewAllKey)}
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        >
                          <path d="M4 2L8 6L4 10" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <nav className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur-xl lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {megaMenuItems.map((item) => (
                <div key={item.labelKey}>
                  <button
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === item.labelKey ? null : item.labelKey
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    {t(item.labelKey)}
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
                        mobileExpanded === item.labelKey ? "rotate-180" : ""
                      }`}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      mobileExpanded === item.labelKey
                        ? "max-h-[600px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pb-2 pl-2">
                      {item.sections.map((section, sIdx) => (
                        <div key={sIdx}>
                          {section.titleKey && (
                            <h3 className="mb-1 mt-3 px-3 text-xs font-semibold uppercase tracking-widest text-muted/60">
                              {t(section.titleKey)}
                            </h3>
                          )}
                          {section.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileExpanded(null);
                              }}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface text-primary">
                                {subItem.icon}
                              </span>
                              <div>
                                <span className="text-sm font-medium text-foreground">
                                  {resolveLabel(subItem.labelKey)}
                                </span>
                                <span className="ml-2 text-xs text-muted">
                                  {t(subItem.descKey)}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Language Switcher */}
              <div className="mt-2 flex flex-wrap gap-2 px-3">
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      switchLocale(loc);
                      setMobileOpen(false);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      locale === loc
                        ? "bg-primary text-white"
                        : "border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {localeLabels[loc].native}
                  </button>
                ))}
              </div>

              <Link
                href="/contact"
                className="mt-3 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileExpanded(null);
                }}
              >
                {t("nav.contact")}
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ── Overlay (dims page when mega menu is open) ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 hidden lg:block ${
          activeMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setActiveMenu(null)}
      />
    </>
  );
}
