"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function ProductNav() {
  const pathname = usePathname();
  const t = useTranslations("common");

  const subPages = [
    { href: "/product", label: t("nav.product") },
    { href: "/product/opti", label: "Opti" },
    { href: "/product/watti", label: "Watti" },
    { href: "/product/greenplanner", label: "GreenPlanner" },
    { href: "/product/save-e", label: "Save-E" },
    { href: "/product/repark", label: "RE:park" },
    { href: "/product/solar-site", label: "SolarScope" },
    { href: "/product/pv-intelligence", label: "PV Intelligence" },
  ];

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">
        {subPages.map((page) => {
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
    </nav>
  );
}
