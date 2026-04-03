"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NinewattLogo from "@/components/icons/NinewattLogo";

export default function SolarFooter() {
  const t = useTranslations("solar.footer");
  const nav = useTranslations("solar.nav");
  const cta = useTranslations("solar.cta");

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <NinewattLogo width={120} height={46} className="[&_path]:fill-white" />
              <span className="text-sm font-semibold text-primary tracking-tight border-l border-zinc-600 pl-2 ml-0.5">
                Solar
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              {t("description")}
            </p>
            <div className="mt-6 space-y-1.5 text-sm">
              <p>Tel. <a href="tel:070-8866-7226" className="hover:text-white transition-colors">070-8866-7226</a></p>
              <p>Email. <a href="mailto:ninewatt@ninewatt.com" className="hover:text-white transition-colors">ninewatt@ninewatt.com</a></p>
            </div>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">서비스</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/solar/services" className="hover:text-white transition-colors">
                  {nav("services")}
                </Link>
              </li>
              <li>
                <Link href="/solar/monitoring" className="hover:text-white transition-colors">
                  {nav("monitoring")}
                </Link>
              </li>
              <li>
                <Link href="/solar/sites" className="hover:text-white transition-colors">
                  {nav("sites")}
                </Link>
              </li>
              <li>
                <Link href="/solar/contact" className="hover:text-white transition-colors">
                  {nav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Related Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">나인와트</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("links.mainSite")}
                </Link>
              </li>
              <li>
                <Link href="/product/pv-intelligence" className="hover:text-white transition-colors">
                  {t("links.pvIntelligence")}
                </Link>
              </li>
              <li>
                <Link href="/product/peak-ess" className="hover:text-white transition-colors">
                  피크저감형 ESS
                </Link>
              </li>
              <li>
                <Link href="/product/save-e" className="hover:text-white transition-colors">
                  Save-E
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} NINEWATT Co., Ltd. All rights reserved.</p>
          <p>대표자 : 김영록 | 사업자등록번호 : 107-88-42750</p>
        </div>
      </div>
    </footer>
  );
}
