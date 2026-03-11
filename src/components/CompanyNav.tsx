"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subPages = [
  { href: "/company", label: "회사 개요" },
  { href: "/company/history", label: "주요 연혁" },
  { href: "/company/career", label: "채용 안내" },
  { href: "/company/global", label: "글로벌 사업" },
  { href: "/company/awards", label: "수상 내역" },
  { href: "/company/patents", label: "특허 & 인증" },
];

export default function CompanyNav() {
  const pathname = usePathname();

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
