"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CompanyNav() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const visible = useScrollDirection();

  useEffect(() => {
    document.body.classList.toggle("subnav-visible", visible);
    return () => document.body.classList.remove("subnav-visible");
  }, [visible]);

  const subPages = [
    { href: "/company", label: t("companyMenu.companyIntro") },
    { href: "/company/history", label: t("companyMenu.history") },
    { href: "/company/career", label: t("companyMenu.career") },
    { href: "/company/awards", label: t("companyMenu.awards") },
    { href: "/company/patents", label: t("companyMenu.patents") },
    { href: "/company/media", label: t("companyMenu.media") },
  ];

  return (
    <nav className={`subnav sticky top-16 z-40 border-b border-border bg-surface/95 backdrop-blur-md transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
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
