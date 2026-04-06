"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NinewattLogo from "@/components/icons/NinewattLogo";

export default function EnergyFooter() {
  const t = useTranslations("energy.footer");
  const nav = useTranslations("energy.nav");

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <NinewattLogo width={120} height={46} className="[&_path]:fill-white" />
              <span className="text-sm font-semibold text-primary tracking-tight border-l border-zinc-600 pl-2 ml-0.5">
                Energy
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

          {/* PV Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{nav("pv")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/energy/solar" className="hover:text-white transition-colors">
                  {nav("pvOm")}
                </Link>
              </li>
              <li>
                <Link href="/energy/solar/monitoring" className="hover:text-white transition-colors">
                  {nav("solarMonitoring")}
                </Link>
              </li>
              <li>
                <Link href="/energy/solar/sites" className="hover:text-white transition-colors">
                  {nav("sites")}
                </Link>
              </li>
              <li>
                <Link href="/energy/products/pv-intelligence" className="hover:text-white transition-colors">
                  {nav("pvIntelligence")}
                </Link>
              </li>
              <li>
                <Link href="/energy/products/solar-site" className="hover:text-white transition-colors">
                  {nav("solarSite")}
                </Link>
              </li>
            </ul>
          </div>

          {/* ESS Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{nav("ess")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/energy/ess" className="hover:text-white transition-colors">
                  {nav("essOm")}
                </Link>
              </li>
              <li>
                <Link href="/energy/ess/monitoring" className="hover:text-white transition-colors">
                  {nav("essMonitoring")}
                </Link>
              </li>
              <li>
                <Link href="/energy/products/peak-ess" className="hover:text-white transition-colors">
                  {nav("peakEss")}
                </Link>
              </li>
              <li>
                <Link href="/energy/products/shared-ess" className="hover:text-white transition-colors">
                  {nav("sharedEss")}
                </Link>
              </li>
            </ul>
          </div>

          {/* PPA, BEMS & Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">기타</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/energy/ppa" className="hover:text-white transition-colors">
                  {nav("ppa")}
                </Link>
              </li>
              <li>
                <Link href="/energy/products/bems" className="hover:text-white transition-colors">
                  {nav("bems")}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("links.mainSite")}
                </Link>
              </li>
              <li>
                <Link href="/energy/contact" className="hover:text-white transition-colors">
                  {nav("contact")}
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
