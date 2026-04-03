"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

type NavItem = { href: string; label: string };
type NavGroup = { label?: string; items: NavItem[] };

export default function ProductNav() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const visible = useScrollDirection();

  useEffect(() => {
    document.body.classList.toggle("subnav-visible", visible);
    return () => document.body.classList.remove("subnav-visible");
  }, [visible]);

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
      label: t("productMenu.pv"),
      items: [
        { href: "/product/pv-intelligence", label: t("productMenu.pvRtuLabel") },
        { href: "/product/solar-site", label: t("productMenu.solarScopeLabel") },
      ],
    },
    {
      label: t("productMenu.platform"),
      items: [
        { href: "/product/greenplanner", label: "GreenPlanner" },
        { href: "/product/repark", label: "RE:park" },
      ],
    },
  ];

  return (
    <nav className={`subnav sticky top-16 z-40 border-b border-border bg-surface/95 backdrop-blur-md transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-6">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && (
              <div className="mx-3 flex shrink-0 items-center gap-2">
                <div className="h-4 w-px bg-border" />
                {group.label && (
                  <span className="text-[11px] font-medium text-muted/50">
                    {group.label}
                  </span>
                )}
              </div>
            )}
            {gi === 0 && group.label && (
              <span className="shrink-0 pr-1 text-[11px] font-medium text-muted/50">
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
                    className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-foreground"
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
