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
