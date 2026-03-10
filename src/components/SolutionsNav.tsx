"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subPages = [
  { href: "/solutions", label: "핵심 솔루션" },
  { href: "/solutions/cases", label: "수행사례" },
  { href: "/solutions/rnd", label: "R&D 과제" },
  { href: "/solutions/services", label: "용역과제" },
];

export default function SolutionsNav() {
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
