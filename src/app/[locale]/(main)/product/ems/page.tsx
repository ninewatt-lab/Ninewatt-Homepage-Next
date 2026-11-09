import ProductJsonLd from "@/components/ProductJsonLd";
import type { Metadata } from "next";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { PlatformGallery, type PlatformShot } from "@/components/PlatformGallery";

// 원본: NINEWATT_FILES/NINEWATT_EMS/소개자료/img (2026-11-05 데모 사이트 캡처)
const IMG = "/images/ems";

type Related = "opti" | "cases" | "rnd";

// 언어와 무관한 값. shots 순서는 product.json 의 ems.platforms.<id>.shots 와 맞춘다
const PLATFORMS: {
  id: "buildat" | "opti" | "vertiport" | "wshp" | "fems" | "jj1000";
  shots: [file: string, width: number, height: number][];
  related?: { key: Related; href: "/solutions/opti" | "/solutions/cases" | "/solutions/rnd" };
}[] = [
  {
    id: "buildat",
    shots: [["01_home", 1440, 900], ["02_building", 1440, 1600], ["03b_map_bousai", 1440, 900], ["05_feed", 1440, 1251], ["08b_ai_answer", 1440, 900]],
    related: { key: "cases", href: "/solutions/cases" },
  },
  {
    id: "opti",
    shots: [["06d_ai_insight", 1440, 900], ["01_home", 1440, 2234], ["02_pv", 1440, 2034], ["03_ess", 1440, 2001], ["06c_chat_solution", 1440, 900]],
    related: { key: "opti", href: "/solutions/opti" },
  },
  {
    id: "vertiport",
    shots: [["01_home", 1440, 1059], ["02a_power", 1150, 406], ["02b_evtol", 1150, 901], ["02c_ev", 1150, 464], ["02d_energy-price", 1150, 510]],
    related: { key: "rnd", href: "/solutions/rnd" },
  },
  {
    id: "wshp",
    shots: [["01_dashboard", 1440, 900], ["02_diagram", 1440, 900], ["04_analysis", 1440, 983], ["07_chatbot", 1440, 900]],
    related: { key: "rnd", href: "/solutions/rnd" },
  },
  {
    id: "fems",
    shots: [["06d_custom_view", 1440, 1273], ["06b_preview", 1440, 900], ["02b_analysis_chat", 1440, 900], ["03_equipment", 1440, 900], ["04_alerts", 1440, 900]],
  },
  {
    id: "jj1000",
    shots: [["01_dashboard", 1440, 1596], ["02b_single-line-diagram", 1440, 983], ["03_panel-detail", 1440, 1795], ["04_alarms", 1440, 1266]],
    related: { key: "cases", href: "/solutions/cases" },
  },
];

type PlatformText = {
  name: string;
  kind: string;
  brief: string;
  lead: string;
  spec: { label: string; value: string }[];
  figs: { value: string; label: string }[];
  features: { title: string; desc: string }[];
  shots: string[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  return buildMetadata({
    locale,
    path: "/product/ems",
    title: t("meta.ems.title"),
    description: t("meta.ems.description"),
  });
}

export default async function EmsPage() {
  const t = await getTranslations("product");

  const base = t.raw("ems.base") as { title: string; desc: string }[];
  const texts = t.raw("ems.platforms") as Record<string, PlatformText>;
  const galleryLabels = t.raw("ems.gallery") as { open: string; close: string; prev: string; next: string };

  const platforms = PLATFORMS.map((p) => {
    const text = texts[p.id];
    const shots: PlatformShot[] = p.shots.map(([file, width, height], i) => ({
      src: `${IMG}/${p.id}/${file}.jpg`,
      width,
      height,
      caption: text.shots[i],
    }));
    return { ...p, text, shots };
  });

  return (
    <>
      <ProductJsonLd
        path="/product/ems"
        metaKey="meta.ems"
        category="Energy Management System (EMS)"
      />

      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Energy Management Platforms
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            {t("ems.heroTitle")}
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("ems.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("ems.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("ems.requestDemo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Overview: 플랫폼 6종 */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("ems.overviewTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("ems.overviewSubtitle")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((p, i) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/50"
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface">
                  <Image
                    src={p.shots[0].src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
                    preload={i < 3}
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium text-primary">
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span> · {p.text.kind}
                  </p>
                  <h3 className="mt-2 text-lg font-bold">{p.text.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text.brief}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 공통 기술 기반 */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("ems.baseTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("ems.baseSubtitle")}</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {base.map((stage, i) => (
              <div key={i} className="h-full rounded-xl border border-border bg-background p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{stage.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      {platforms.map((p, i) => (
        <section
          key={p.id}
          id={p.id}
          className={`scroll-mt-32 border-t border-border px-6 py-24 ${i % 2 === 1 ? "bg-surface" : ""}`}
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <p className="text-sm font-medium text-primary">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span> · {p.text.kind}
                </p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">{p.text.name}</h2>
                <p className="mt-5 text-lg leading-relaxed text-muted">{p.text.lead}</p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {p.text.figs.map((fig, fi) => (
                    <div key={fi} className="border-l-2 border-primary pl-3">
                      <p className="text-xl font-bold text-primary md:text-2xl">{fig.value}</p>
                      <p className="mt-1 text-sm leading-snug text-muted">{fig.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <dl className="divide-y divide-border rounded-xl border border-border">
                  {p.text.spec.map((row, ri) => (
                    <div key={ri} className="flex gap-4 px-5 py-3.5">
                      <dt className="w-20 shrink-0 text-sm text-muted">{row.label}</dt>
                      <dd className="text-sm font-medium leading-relaxed">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {p.related && (
                  <Link
                    href={p.related.href}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {t(`ems.related.${p.related.key}`)} →
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-12">
              <PlatformGallery shots={p.shots} alt={p.text.name} labels={galleryLabels} />
            </div>

            <h3 className="mt-14 text-lg font-bold">{t("ems.featuresTitle")}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {p.text.features.map((f, fi) => (
                <div key={fi} className={`rounded-lg border border-border p-5 ${i % 2 === 1 ? "bg-background" : ""}`}>
                  <h4 className="font-bold">{f.title}</h4>
                  <p className="mt-2 text-base leading-relaxed text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Note */}
      <section className="border-t border-border px-6 py-8">
        <p className="mx-auto max-w-5xl text-sm text-muted">{t("ems.note")}</p>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("ems.ctaTitle")}</h2>
            <p className="mt-2 text-base text-muted">{t("ems.ctaDesc")}</p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("ems.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
