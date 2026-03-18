"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function SolutionsNav() {
  const pathname = usePathname();
  const t = useTranslations("common");

  const subPages = [
    { href: "/solutions", label: t("solutionsMenu.coreSolutions") },
    { href: "/solutions/cases", label: t("solutionsMenu.cases") },
    { href: "/solutions/rnd", label: t("solutionsMenu.rnd") },
    { href: "/solutions/services", label: t("solutionsMenu.services") },
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
