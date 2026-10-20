import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { formatClock, getLabProject } from "@/data/labProjects";
import energyData from "@/data/lab/ai-building-workspace-energy.json";
import { LabFilm } from "@/components/lab/LabFilm";
import LabModelViewer, { type ViewerLabels } from "@/components/lab/LabModelViewer";
import Retrofit from "@/components/lab/Retrofit";

/**
 * 2026 대한민국 ESG 친환경 대전 부스 QR 랜딩.
 * Lab AI Building Workspace(v1) 결과 + 그린리모델링 예시 견적 + EnergyPlus 간이 시뮬레이션.
 * 에너지·견적 숫자는 src/data/lab/ai-building-workspace-energy.json (scripts/lab/energy_idf.py 결과).
 */

type Params = Promise<{ locale: string }>;

const SLUG = "ai-building-workspace";
const ABW = "/lab/ai-building-workspace";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "expo" });
  const project = getLabProject(SLUG);
  return buildMetadata({
    locale,
    path: "/expo",
    title: t("meta.title"),
    description: t("meta.description"),
    ogImage: project?.og,
  });
}

const STEPS = [
  { key: "drawing", src: `${ABW}/plan.webp`, width: 1400, height: 1619 },
  { key: "rooms", src: `${ABW}/rooms.webp`, width: 1400, height: 1619 },
  { key: "model", src: `${ABW}/photo-1f-r2.webp`, width: 1800, height: 1125 },
  { key: "takeoff", src: `${ABW}/takeoff-1f.webp`, width: 1400, height: 1803 },
  { key: "energy", src: null, width: 0, height: 0 },
] as const;

const EXPO = `${ABW}/expo`;

/** 부스 영상 v4 (scripts/lab/expo_film.py). 챕터 시작 초는 그 타임라인의 장면 시작과 같다 */
const FILM = {
  src: `${EXPO}/expo-film-v4.mp4`,
  poster: `${EXPO}/poster.webp`,
  chapters: [0, 5.3, 14.1, 21.4, 28.7, 34.0, 39.3, 47.6, 55.9, 61.7, 68.0, 75.3],
};

const CONNECT = [
  { key: "energyStudio", href: null },
  { key: "greenplanner", href: "/product/greenplanner" },
  { key: "grai", href: "https://grai.ibed.cloud" },
] as const;

export default async function ExpoPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "expo" });
  const tl = await getTranslations({ locale, namespace: "lab" });
  const project = getLabProject(SLUG)!;
  const chapterLabels = t.raw("film.chapters") as string[];
  const chapters = FILM.chapters.map((start, i) => ({ start, label: chapterLabels[i], clock: formatClock(start) }));
  const { before, after } = energyData.energy;
  const saving = Math.round((1 - (after.heat + after.cool) / (before.heat + before.cool)) * 100);
  const estimate = energyData.estimate;

  const highlights = [
    { key: "drawing", value: "14,682" },
    { key: "rooms", value: "12" },
    { key: "saving", value: `−${saving}%` },
    { key: "estimate", value: `${(estimate.total / 1e6).toFixed(1)}M ₩` },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-14 pt-12 md:pt-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {t("badge")}
          </span>
          <h1 className="mt-6 whitespace-pre-line text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t("hero.desc")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("hero.ctaContact")}
            </Link>
            <Link
              href={`/lab/${SLUG}`}
              className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("hero.ctaLab")}
            </Link>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface">
            <Image
              src={`${ABW}/photo-exterior-r2.webp`}
              alt={t("hero.imageAlt")}
              width={1800}
              height={1125}
              priority
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="h-auto w-full"
            />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.key} className="bg-background px-5 py-4">
                <dt className="text-xs leading-snug text-muted">{t(`highlights.${h.key}`)}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Film */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-sm uppercase tracking-widest text-muted">{t("film.title")}</h2>
          <LabFilm
            src={FILM.src}
            poster={FILM.poster}
            title={t("meta.title")}
            chapters={chapters}
            chapterNavLabel={tl("detail.chapterNav")}
            disclaimer={t("film.disclaimer")}
          />
        </div>
      </section>

      {/* Steps */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold md:text-3xl">{t("steps.title")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{t("steps.intro")}</p>
          <ol className="mt-10 grid gap-6 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <li
                key={s.key}
                className={`overflow-hidden rounded-xl border border-border bg-background ${
                  s.src ? "" : "md:col-span-2 md:grid md:grid-cols-2"
                }`}
              >
                {s.src ? (
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-white">
                    <Image
                      src={s.src}
                      alt={t(`steps.items.${s.key}.title`)}
                      width={s.width}
                      height={s.height}
                      sizes="(min-width: 768px) 32rem, 100vw"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <a
                    href="#energy"
                    className="flex aspect-[16/10] items-center justify-center border-b border-border bg-primary/10 md:aspect-auto md:min-h-48 md:border-b-0 md:border-r"
                  >
                    <span className="text-5xl font-bold tabular-nums text-primary">−{saving}%</span>
                  </a>
                )}
                <div className="p-5">
                  <p className="text-xs font-semibold text-primary">STEP {i + 1}</p>
                  <h3 className="mt-1 text-lg font-bold">{t(`steps.items.${s.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(`steps.items.${s.key}.desc`)}</p>
                </div>
              </li>
            ))}
          </ol>

          {project.caseStudy?.viewer && (
            <figure className="mt-12">
              <LabModelViewer
                dataUrl={project.caseStudy.viewer.data}
                poster={{ src: `${ABW}/model-axo.webp`, width: 1800, height: 1233 }}
                posterAlt={tl(`projects.${SLUG}.case.figures.model.title`)}
                labels={tl.raw("detail.viewer") as ViewerLabels}
                roomNames={tl.raw(`projects.${SLUG}.case.rooms`) as Record<string, string>}
              />
              <figcaption className="mt-3 text-sm leading-relaxed text-muted">
                {tl(`projects.${SLUG}.case.figures.model.caption`)}
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* 그린리모델링 · 에너지 · 태양광 · 견적 (Lab 상세와 공유) */}
      <Retrofit t={t} />

      {/* Connect */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold md:text-3xl">{t("connect.title")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{t("connect.intro")}</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {CONNECT.map((c) => (
              <li key={c.key} className="flex flex-col rounded-xl border border-border p-5">
                <h3 className="text-lg font-bold">{t(`connect.items.${c.key}.name`)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t(`connect.items.${c.key}.desc`)}</p>
                {c.href &&
                  (c.href.startsWith("http") ? (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-sm font-semibold text-primary hover:underline"
                    >
                      {t("connect.more")} ↗
                    </a>
                  ) : (
                    <Link href={c.href} className="mt-4 text-sm font-semibold text-primary hover:underline">
                      {t("connect.more")} →
                    </Link>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("cta.title")}</h2>
          <p className="mt-3 max-w-2xl text-base text-muted">{t("cta.desc")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("cta.contact")}
            </Link>
            <Link
              href="/lab"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-background"
            >
              {t("cta.lab")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
