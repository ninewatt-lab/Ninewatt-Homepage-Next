"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold text-foreground">Ninewatt</p>
            <p className="mt-3 text-sm leading-relaxed text-muted whitespace-pre-line">
              {t("footer.tagline")}
            </p>
            <div className="mt-4 space-y-1 text-sm text-muted">
              <p>{t("footer.hq")}</p>
              <p>{t("footer.rnd")}</p>
              <p>Tel. 070-8866-7226</p>
              <p>Email. ninewatt@ninewatt.com</p>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="https://kr.linkedin.com/company/ninewatt-global"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-muted transition-colors hover:text-foreground"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/9ninewatt/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-muted transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-semibold text-foreground">{t("footer.quickLinks")}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <Link href="/product" className="transition-colors hover:text-foreground">Product</Link>
              <Link href="/solutions" className="transition-colors hover:text-foreground">Solutions</Link>
              <Link href="/company" className="transition-colors hover:text-foreground">Company</Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">Contact Us</Link>
            </div>
          </div>

          <div>
            <p className="font-semibold text-foreground">{t("footer.more")}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <Link href="/company/patents" className="transition-colors hover:text-foreground">{t("footer.patentsAndCerts")}</Link>
              <Link href="/company/global" className="transition-colors hover:text-foreground">{t("footer.globalBiz")}</Link>
              <Link href="/company/awards" className="transition-colors hover:text-foreground">{t("footer.awardsLink")}</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-8">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} NINEWATT Co., Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
