"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

/* ──────────────────────────────────────────────
   Navigation data with sub-items
   ────────────────────────────────────────────── */

interface NavSubItem {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavSubItem[];
}

interface NavItemWithChildren {
  href: string;
  label: string;
  sections: NavSection[];
}

const productNav: NavItemWithChildren = {
  href: "/product",
  label: "Product",
  sections: [
    {
      title: "플랫폼",
      items: [
        {
          href: "/product/watti",
          label: "Watti",
          desc: "3D 건물 에너지 분석 플랫폼",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M12 3L2 9l10 6 10-6-10-6z" /><path d="M2 17l10 6 10-6" /><path d="M2 13l10 6 10-6" />
            </svg>
          ),
        },
        {
          href: "/product/opti",
          label: "Opti",
          desc: "AI 기반 건물 에너지 어드바이저",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z" />
              <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          ),
        },
        {
          href: "/product/save-e",
          label: "Save-E",
          desc: "건물 에너지 관리 및 비용 최적화",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "앱 & 서비스",
      items: [
        {
          href: "/product/greenplanner",
          label: "GreenPlanner",
          desc: "그린리모델링 시뮬레이션 앱",
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
          label: "RE:park",
          desc: "QR 기반 스마트 시설 관리 시스템",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
          ),
        },
      ],
    },
  ],
};

const solutionsNav: NavItemWithChildren = {
  href: "/solutions",
  label: "Solutions",
  sections: [
    {
      title: "역량",
      items: [
        {
          href: "/solutions",
          label: "핵심 솔루션",
          desc: "에너지 데이터·AI·시뮬레이션 역량",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v4m0 14v4m-8.66-15l3.46 2m10.4 6l3.46 2M1.34 15l3.46-2m10.4-6l3.46-2M1.34 9l3.46 2m10.4 6l3.46 2m-14.32 0l3.46-2m10.4-6l3.46-2" />
            </svg>
          ),
        },
        {
          href: "/solutions/cases",
          label: "수행사례",
          desc: "60건 이상의 국내외 프로젝트",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "실적",
      items: [
        {
          href: "/solutions/rnd",
          label: "R&D 이력",
          desc: "정부 R&D 과제 수행 실적",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/solutions/services",
          label: "용역과제",
          desc: "기업·기관 용역 수행 이력",
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
  label: "Company",
  sections: [
    {
      title: "소개",
      items: [
        {
          href: "/company",
          label: "회사소개",
          desc: "비전·미션·조직·위치",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
            </svg>
          ),
        },
        {
          href: "/company/global",
          label: "글로벌 사업",
          desc: "일본·영국·프랑스·미국 진출",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "성과",
      items: [
        {
          href: "/company/history",
          label: "연혁",
          desc: "나인와트의 주요 발자취",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        },
        {
          href: "/company/awards",
          label: "수상 내역",
          desc: "CES·정부 포상 등 수상 기록",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M8 21h8m-4-4v4m-4.5-9.25L7 8.5V3h10v5.5l-.5 3.25" />
              <path d="M5 3h14" /><path d="M7 8.5H5a2 2 0 00-2 2c0 2.5 2 4 4 4.5m10-6.5h2a2 2 0 012 2c0 2.5-2 4-4 4.5" />
            </svg>
          ),
        },
        {
          href: "/company/patents",
          label: "특허 & 인증",
          desc: "33건의 특허 및 주요 인증",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M12 2L9 9H2l5.5 4.5L5 21l7-5 7 5-2.5-7.5L22 9h-7L12 2z" />
            </svg>
          ),
        },
      ],
    },
  ],
};

const megaMenuItems: NavItemWithChildren[] = [productNav, solutionsNav, companyNav];

/* ──────────────────────────────────────────────
   Header Component
   ────────────────────────────────────────────── */

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleMouseEnter = useCallback((label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  }, []);

  const handleDropdownEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled || mobileOpen || activeMenu
            ? "bg-background/80 border-b border-border backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            Ninewatt
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {megaMenuItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeMenu === item.label
                      ? "text-foreground bg-surface"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`h-3 w-3 transition-transform duration-200 ${
                      activeMenu === item.label ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </Link>
              </div>
            ))}

            <div className="ml-4 flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
                aria-label="테마 전환"
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
                문의하기
              </Link>
            </div>
          </nav>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
              aria-label="테마 전환"
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
              aria-label="메뉴"
            >
              <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Desktop Mega Menu Dropdown ── */}
        <div
          className={`hidden lg:block absolute left-0 w-full transition-all duration-300 ease-out ${
            activeMenu
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="border-b border-border bg-background/95 backdrop-blur-xl shadow-xl shadow-black/3">
            <div className="mx-auto max-w-7xl px-6 py-6">
              {megaMenuItems.map((item) => (
                <div
                  key={item.label}
                  className={`${activeMenu === item.label ? "block" : "hidden"}`}
                >
                  <div className="flex gap-12">
                    {item.sections.map((section, sIdx) => (
                      <div key={sIdx} className="min-w-60">
                        {section.title && (
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted/70">
                            {section.title}
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
                                  {subItem.label}
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
                                  {subItem.desc}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Right side: Overview link */}
                    <div className="ml-auto flex items-end">
                      <Link
                        href={item.href}
                        onClick={() => setActiveMenu(null)}
                        className="group inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        {item.label} 전체보기
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

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <nav className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur-xl lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {megaMenuItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === item.label ? null : item.label
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    {item.label}
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
                        mobileExpanded === item.label ? "rotate-180" : ""
                      }`}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      mobileExpanded === item.label
                        ? "max-h-[600px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pb-2 pl-2">
                      {item.sections.map((section, sIdx) => (
                        <div key={sIdx}>
                          {section.title && (
                            <h3 className="mb-1 mt-3 px-3 text-xs font-semibold uppercase tracking-widest text-muted/60">
                              {section.title}
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
                                  {subItem.label}
                                </span>
                                <span className="ml-2 text-xs text-muted">
                                  {subItem.desc}
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

              <Link
                href="/contact"
                className="mt-3 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileExpanded(null);
                }}
              >
                문의하기
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ── Overlay (dims page when mega menu is open) ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 hidden lg:block ${
          activeMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setActiveMenu(null)}
      />
    </>
  );
}
