import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { absoluteUrl, buildMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { formatClock, getLabProject, type LabCaseStudy } from "@/data/labProjects";
import JsonLd from "@/components/JsonLd";
import LabStatusBadge from "@/components/lab/LabStatusBadge";
import LabCta, { type LabTranslate } from "@/components/lab/LabCta";
import { LabFilm } from "@/components/lab/LabFilm";
import LabCompare from "@/components/lab/LabCompare";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getLabProject(slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: "lab" });
  return buildMetadata({
    locale,
    path: `/lab/${slug}`,
    title: t(`projects.${slug}.name`),
    description: t(`projects.${slug}.summary`),
    ogImage: project.og,
  });
}

function Figure({
  n,
  src,
  width,
  height,
  title,
  caption,
  sizes,
}: {
  n: number;
  src: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  sizes: string;
}) {
  return (
    <figure>
      {/* Drawings are black-on-white, so the frame stays white in dark mode too */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <Image src={src} alt={title} width={width} height={height} sizes={sizes} className="h-auto w-full" />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted">
        <span className="text-xs font-semibold text-foreground">FIG. {n}</span>
        <span className="ml-2 font-semibold text-foreground">{title}</span>
        <span className="mt-1 block">{caption}</span>
      </figcaption>
    </figure>
  );
}

function CaseStudy({ cs, t, k }: { cs: LabCaseStudy; t: LabTranslate; k: string }) {
  const c = `${k}.case`;
  const confirmed = t.raw(`${c}.findings.confirmed`) as string[];
  const open = t.raw(`${c}.findings.open`) as string[];
  const [plan, rooms, ...rest] = cs.figures;
  let n = 0;

  const noted = cs.areas?.noted;
  const allRooms = cs.areas?.floors.flatMap((f) => f.rooms) ?? [];
  const computed = noted
    ? noted.rooms.reduce((sum, key) => sum + (allRooms.find((r) => r.key === key)?.area ?? 0), 0)
    : 0;

  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold md:text-3xl">{t(`${c}.title`)}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{t(`${c}.intro`)}</p>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {cs.stats.map((s) => (
            <div key={s.key} className="bg-background px-5 py-4">
              <dt className="text-xs text-muted">{t(`${c}.stats.${s.key}`)}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>

        {/* plan and computed rooms side by side: same drawing, before/after */}
        {plan && rooms && (
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {[plan, rooms].map((f) => (
              <Figure
                key={f.key}
                n={++n}
                src={f.src}
                width={f.width}
                height={f.height}
                title={t(`${c}.figures.${f.key}.title`)}
                caption={t(`${c}.figures.${f.key}.caption`)}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ))}
          </div>
        )}

        {rest.map((f) => (
          <div key={f.key} className="mt-16">
            <Figure
              n={++n}
              src={f.src}
              width={f.width}
              height={f.height}
              title={t(`${c}.figures.${f.key}.title`)}
              caption={t(`${c}.figures.${f.key}.caption`)}
              sizes="(min-width: 1024px) 64rem, 100vw"
            />
          </div>
        ))}

        {cs.comparison && (
          <figure className="mt-16">
            <LabCompare
              {...cs.comparison}
              labels={{
                drawing: t(`${c}.compare.drawing`),
                model: t(`${c}.compare.model`),
                overlay: t(`${c}.compare.overlay`),
                split: t(`${c}.compare.split`),
                handle: t(`${c}.compare.handle`),
                legend: t(`${c}.compare.legend`),
              }}
            />
            <figcaption className="mt-3 text-sm leading-relaxed text-muted">
              <span className="text-xs font-semibold text-foreground">FIG. {++n}</span>
              <span className="ml-2 font-semibold text-foreground">{t(`${c}.compare.title`)}</span>
              <span className="mt-1 block">{t(`${c}.compare.caption`)}</span>
            </figcaption>
          </figure>
        )}

        {cs.areas && (
          <div className="mt-20">
            <h3 className="text-xl font-bold">{t(`${c}.areas.title`)}</h3>
            <p className="mt-2 text-sm text-muted">{t(`${c}.areas.basis`)}</p>
            <div className="mt-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-xs text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">{t(`${c}.areas.room`)}</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">{t(`${c}.areas.area`)}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{t(`${c}.areas.state`)}</th>
                  </tr>
                </thead>
                {cs.areas.floors.map((floor) => (
                  <tbody key={floor.key} className="divide-y divide-border border-t border-border">
                    <tr className="bg-surface/60">
                      <th scope="rowgroup" colSpan={3} className="px-5 py-2 text-xs font-semibold text-foreground">
                        {t(`${c}.areas.floors.${floor.key}`)}
                      </th>
                    </tr>
                    {floor.rooms.map((r) => (
                      <tr key={r.key}>
                        <td className="px-5 py-3">{t(`${c}.rooms.${r.key}`)}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{r.area.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span className={r.review ? "text-amber-700 dark:text-amber-400" : "text-muted"}>
                            {t(`${c}.areas.${r.review ? "review" : "auto"}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            {noted && (
              <div className="mt-6 rounded-xl border border-border p-5">
                <p className="text-xs text-muted">{t(`${c}.areas.notedScope`)}</p>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm text-muted">{t(`${c}.areas.notedLabel`)}</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums">{noted.value.toFixed(2)} ㎡</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">{t(`${c}.areas.computedLabel`)}</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums">{computed.toFixed(2)} ㎡</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">{t(`${c}.areas.diffLabel`)}</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                      {(computed - noted.value).toFixed(2)} ㎡
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-muted">{t(`${c}.areas.note`)}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-20">
          <h3 className="text-xl font-bold">{t(`${c}.findings.title`)}</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-semibold text-primary">{t(`${c}.findings.confirmedTitle`)}</p>
              <ul className="mt-4 space-y-3">
                {confirmed.map((item, i) => (
                  <li key={i} className="border-l-2 border-primary pl-3 text-sm leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{t(`${c}.findings.openTitle`)}</p>
              <ul className="mt-4 space-y-3">
                {open.map((item, i) => (
                  <li key={i} className="border-l-2 border-amber-500 pl-3 text-sm leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function LabProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const project = getLabProject(slug);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: "lab" });
  const key = `projects.${slug}`;
  const name = t(`${key}.name`);
  const summary = t(`${key}.summary`);
  const tags = t.raw(`${key}.tags`) as string[];
  const why = t.raw(`${key}.why`) as string[];
  const chapterLabels = (project.video ? t.raw(`${key}.chapters`) : []) as string[];
  const chapters = (project.video?.chapters ?? []).map((start, i) => ({
    start,
    label: chapterLabels[i],
    clock: formatClock(start),
  }));

  const path = `/lab/${slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: "Ninewatt", path: "/" },
          { name: "Ninewatt Lab", path: "/lab" },
          { name, path },
        ])}
      />
      {project.video && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: `${name} — ${t("detail.film")}`,
            description: summary,
            thumbnailUrl: `${SITE_URL}${project.video.poster}`,
            contentUrl: project.video.src,
            uploadDate: project.video.uploadDate,
            duration: `PT${project.video.duration}S`,
            url: absoluteUrl(locale, path),
            hasPart: chapters.map((ch, i) => ({
              "@type": "Clip",
              name: ch.label,
              startOffset: Math.floor(ch.start),
              endOffset: Math.floor(chapters[i + 1]?.start ?? project.video!.duration),
              url: absoluteUrl(locale, path),
            })),
          }}
        />
      )}

      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <Link href="/lab" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M8 2L4 6L8 10" />
            </svg>
            {t("detail.back")}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <LabStatusBadge status={project.status} label={t(`status.${project.status}`)} />
            {tags.map((tag) => (
              <span key={tag} className="rounded-md border border-border px-2.5 py-1 text-xs text-muted">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{name}</h1>
          <p className="mt-4 text-xl text-primary md:text-2xl">{t(`${key}.tagline`)}</p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{summary}</p>
          {project.graduatedTo && (
            <Link
              href={project.graduatedTo}
              className="mt-8 inline-flex rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("detail.graduated")}
            </Link>
          )}
        </div>
      </section>

      {project.video && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-sm uppercase tracking-widest text-muted">{t("detail.film")}</h2>
            <LabFilm
              src={project.video.src}
              poster={project.video.poster}
              title={`${name} — ${t("detail.film")}`}
              chapters={chapters}
              chapterNavLabel={t("detail.chapterNav")}
              disclaimer={t("detail.disclaimer")}
            />
          </div>
        </section>
      )}

      {/* Why */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:gap-12">
          <h2 className="shrink-0 text-2xl font-bold md:w-64">{t("detail.why")}</h2>
          <div className="mt-6 space-y-5 md:mt-0">
            {why.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {project.caseStudy && <CaseStudy cs={project.caseStudy} t={t} k={key} />}

      <LabCta t={t} />
    </>
  );
}
