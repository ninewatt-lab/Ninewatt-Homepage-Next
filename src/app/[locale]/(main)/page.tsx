import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  SmesAndStartups,
  SeoulMetropolitanGov,
  Gyeonggido,
  IcnMetropolitanCity,
  SeoulFacilities,
  Gangnamgu,
  LSelectric,
  Kepco,
} from "@/components/logos/contractors";
import {
  Molit,
  KoreaEnergyAgency,
  Msit,
  Motie,
  Moe,
  KepcoKdn,
  HyundaiEng,
  Kict,
  SinanenHoldings,
  Toltek,
  Ucl,
  JohnsonControls,
  Azbil,
  ThurrockCouncil,
  BluepointPartners,
} from "@/components/logos/partners";
import VideoHero from "@/components/VideoHero";
import ScrollReveal from "@/components/ScrollReveal";
import ProductShowcase from "@/components/ProductShowcase";
import CountUp from "@/components/CountUp";
import LogoMarquee from "@/components/LogoMarquee";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const investmentByLocale: Record<string, string> = {
    ko: "48억",
    en: "$3.3M",
    ja: "5.2億円",
    fr: "3M€",
  };
  const stats = [
    { value: "30+", label: t("stats.employees") },
    { value: "60+", label: t("stats.projects") },
    { value: "96.81%", label: t("stats.growth") },
    { value: investmentByLocale[locale] ?? "$3.3M", label: t("stats.investment") },
    { value: "33", label: t("stats.patents") },
  ];

  return (
    <>
      {/* Hero — Full-screen video background */}
      <VideoHero />

      {/* Products — Sticky text + scrolling media */}
      <ProductShowcase />

      {/* What we do — asymmetric layout */}
      <ScrollReveal>
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-5">
              {/* Large card */}
              <Link
                href="/solutions/opti"
                className="group relative md:col-span-3 rounded-2xl border border-border p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Product
                </p>
                <h3 className="mt-4 text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">
                  {t("cards.optiTitle")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t("cards.optiDesc")}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("cards.optiLink")}
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-primary/10 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>

              {/* Stacked small cards */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <Link
                  href="/solutions"
                  className="group relative flex-1 rounded-2xl border border-border p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    Solutions
                  </p>
                  <h3 className="mt-4 text-lg font-bold transition-colors group-hover:text-primary">
                    {t("cards.solutionsTitle")}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {t("cards.solutionsDesc")}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                    {t("cards.explore")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
                <Link
                  href="/solutions/global"
                  className="group relative flex-1 rounded-2xl border border-border p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    Global
                  </p>
                  <h3 className="mt-4 text-lg font-bold transition-colors group-hover:text-primary">
                    {t("cards.globalTitle")}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {t("cards.globalDesc")}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                    {t("cards.explore")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Partners — Infinite marquee logo cloud */}
      <ScrollReveal>
        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {t("partners.label")}
            </p>
            <div className="mt-12">
              <LogoMarquee
                row1={[
                  <Kepco key="kepco" />,
                  <LSelectric key="ls" />,
                  <SmesAndStartups key="smes" />,
                  <SeoulMetropolitanGov key="seoul" />,
                  <Gyeonggido key="gyeonggi" />,
                  <IcnMetropolitanCity key="incheon" />,
                  <SeoulFacilities key="facilities" />,
                  <Gangnamgu key="gangnam" />,
                  <Molit key="molit" />,
                  <KoreaEnergyAgency key="kea" />,
                  <Msit key="msit" />,
                  <Kict key="kict" />,
                ]}
                row2={[
                  <Motie key="motie" />,
                  <Moe key="moe" />,
                  <KepcoKdn key="kepco-kdn" />,
                  <HyundaiEng key="hyundai" />,
                  <SinanenHoldings key="sinanen" />,
                  <Toltek key="toltek" />,
                  <Ucl key="ucl" />,
                  <JohnsonControls key="jc" />,
                  <Azbil key="azbil" />,
                  <ThurrockCouncil key="thurrock" />,
                  <BluepointPartners key="bluepoint" />,
                ]}
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Numbers */}
      <ScrollReveal>
        <section className="border-y border-border px-6 py-14">
          <div className="mx-auto grid max-w-5xl grid-cols-3 justify-items-center gap-y-10 md:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <CountUp value={stat.value} className="text-2xl font-bold md:text-3xl" />
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("cta.heading")}
            </h2>
            <p className="mt-4 max-w-lg text-muted">
              {t("cta.description")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
