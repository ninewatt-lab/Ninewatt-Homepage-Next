"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };
type NavGroup = { label?: string; items: NavItem[] };

export default function ProductNav() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const visible = useScrollDirection();
  // Product 첫 화면(3D 지역)에서는 헤더처럼 캔버스 위에 겹쳐 자리를 차지하지 않는다
  const overlay = pathname === "/product";
  const [scrolled, setScrolled] = useState(false);
  const clear = overlay && !scrolled;

  useEffect(() => {
    document.body.classList.toggle("subnav-visible", visible);
    return () => document.body.classList.remove("subnav-visible");
  }, [visible]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const groups: NavGroup[] = [
    {
      items: [
        { href: "/product", label: t("productMenu.overview") },
      ],
    },
    {
      label: t("productMenu.ess"),
      items: [
        { href: "/product/shared-ess", label: t("productMenu.sharedEssLabel") },
        { href: "/product/peak-ess", label: t("productMenu.peakEssLabel") },
      ],
    },
    {
      label: t("productMenu.ems"),
      items: [
        { href: "/product/bems", label: "BEMS" },
        { href: "/product/pv-intelligence", label: t("productMenu.pvRemsLabel") },
      ],
    },
    {
      label: t("productMenu.platform"),
      items: [
        { href: "/product/greenplanner", label: "GreenPlanner" },
        { href: "/product/repark", label: "RE:park" },
        { href: "/product/solar-site", label: "SolarScope" },
      ],
    },
  ];

  return (
    <nav
      className={`subnav top-16 z-40 border-b transition-[transform,background-color,border-color] duration-300 ${overlay ? "fixed inset-x-0" : "sticky"} ${
        clear ? "border-transparent bg-transparent" : "border-border bg-background/90 backdrop-blur-xl"
      } ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-6">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && (
              <div className="mx-3 flex shrink-0 items-center gap-2">
                <div className={`h-4 w-px ${clear ? "bg-white/20" : "bg-border"}`} />
                {group.label && (
                  <span className={`text-[13px] font-medium ${clear ? "text-white/40" : "text-muted/50"}`}>
                    {group.label}
                  </span>
                )}
              </div>
            )}
            {gi === 0 && group.label && (
              <span className="shrink-0 pr-1 text-[13px] font-medium text-muted/50">
                {group.label}
              </span>
            )}
            <div className="flex gap-1">
              {group.items.map((page) => {
                const isActive = pathname === page.href;
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={`shrink-0 border-b-2 px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? clear
                          ? "border-primary-light text-primary-light"
                          : "border-primary text-primary"
                        : clear
                          ? "border-transparent text-white/75 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] hover:text-white"
                          : "border-transparent text-foreground/75 hover:text-foreground"
                    }`}
                  >
                    {page.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
