"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subPages = [
  { href: "/product", label: "제품 소개" },
  { href: "/product/watti", label: "Watti" },
  { href: "/product/opti", label: "Opti" },
  { href: "/product/greenplanner", label: "GreenPlanner" },
  { href: "/product/save-e", label: "Save-E" },
  { href: "/product/repark", label: "RE:park" },
];

export default function ProductNav() {
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
