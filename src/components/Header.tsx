"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/about", label: "회사소개" },
  { href: "/solutions", label: "솔루션" },
  { href: "/product/opti", label: "Opti" },
  { href: "/cases", label: "수행사례" },
  { href: "/research", label: "R&D" },
  { href: "/patents", label: "특허" },
  { href: "/global", label: "글로벌" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[.08] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Ninewatt
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            문의하기
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="flex flex-col gap-1.5 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴"
        >
          <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-foreground transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-black/[.08] bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-2 rounded-full bg-primary px-5 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              onClick={() => setMobileOpen(false)}
            >
              문의하기
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
