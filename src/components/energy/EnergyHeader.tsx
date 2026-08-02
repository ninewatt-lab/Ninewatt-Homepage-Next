"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NinewattLogo from "@/components/icons/NinewattLogo";

type DropdownItem = {
  href: string;
  labelKey: string;
  separator?: boolean;
};

type NavItem = {
  href: string;
  labelKey: string;
  dropdown?: DropdownItem[];
};

const navItems: NavItem[] = [
  { href: "/energy", labelKey: "home" },
  {
    href: "/energy/solar",
    labelKey: "pv",
    dropdown: [
      { href: "/energy/solar", labelKey: "pvOm" },
      { href: "/energy/solar/services", labelKey: "solarServices" },
      { href: "/energy/solar/monitoring", labelKey: "solarMonitoring" },
      { href: "/energy/solar/sites", labelKey: "sites" },
      { href: "/product/pv-intelligence", labelKey: "pvIntelligence", separator: true },
      { href: "/product/solar-site", labelKey: "solarSite" },
    ],
  },
  {
    href: "/energy/ess",
    labelKey: "ess",
    dropdown: [
      { href: "/energy/ess", labelKey: "essOm" },
      { href: "/energy/ess/services", labelKey: "essServices" },
      { href: "/energy/ess/monitoring", labelKey: "essMonitoring" },
      { href: "/product/peak-ess", labelKey: "peakEss", separator: true },
      { href: "/product/shared-ess", labelKey: "sharedEss" },
    ],
  },
  { href: "/energy/ppa", labelKey: "ppa" },
  { href: "/product/bems", labelKey: "bems" },
];

export default function EnergyHeader() {
  const t = useTranslations("energy.nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/energy" || pathname === "/energy/";
  const showSolid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          <Link href="/energy" className="flex items-center gap-2">
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
              Energy
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {navItems.map((item) => (
              <div key={item.href} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.labelKey ? null : item.labelKey)
                      }
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 ${
                        showSolid
                          ? "text-zinc-600 dark:text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {t(item.labelKey)}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${
                          openDropdown === item.labelKey ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === item.labelKey && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50">
                        {item.dropdown.map((sub) => (
                          <div key={sub.href}>
                            {sub.separator && (
                              <div className="mx-3 my-1 border-t border-zinc-100 dark:border-zinc-800" />
                            )}
                            <Link
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                              {t(sub.labelKey)}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showSolid
                        ? "text-zinc-600 dark:text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                )}
              </div>
            ))}
            <Link
              href="/energy/contact"
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <Link
              href="/energy"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              {t("home")}
            </Link>

            {/* PV section */}
            <p className="px-3 pt-3 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t("pv")}
            </p>
            <Link href="/energy/solar" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("pvOm")}
            </Link>
            <Link href="/energy/solar/services" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("solarServices")}
            </Link>
            <Link href="/energy/solar/monitoring" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("solarMonitoring")}
            </Link>
            <Link href="/energy/solar/sites" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("sites")}
            </Link>
            <Link href="/product/pv-intelligence" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("pvIntelligence")}
            </Link>
            <Link href="/product/solar-site" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("solarSite")}
            </Link>

            {/* ESS section */}
            <p className="px-3 pt-3 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t("ess")}
            </p>
            <Link href="/energy/ess" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("essOm")}
            </Link>
            <Link href="/energy/ess/services" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("essServices")}
            </Link>
            <Link href="/energy/ess/monitoring" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("essMonitoring")}
            </Link>
            <Link href="/product/peak-ess" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("peakEss")}
            </Link>
            <Link href="/product/shared-ess" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 pl-6">
              {t("sharedEss")}
            </Link>

            {/* PPA & BEMS */}
            <div className="pt-2 space-y-1">
              <Link href="/energy/ppa" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                {t("ppa")}
              </Link>
              <Link href="/product/bems" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                {t("bems")}
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/energy/contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              >
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
