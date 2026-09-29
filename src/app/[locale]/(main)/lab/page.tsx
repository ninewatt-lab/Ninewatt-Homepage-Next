import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { labProjects, type LabProject } from "@/data/labProjects";
import LabStatusBadge from "@/components/lab/LabStatusBadge";
import LabCta, { type LabTranslate as Translate } from "@/components/lab/LabCta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lab" });
  return buildMetadata({
    locale,
    path: "/lab",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

function PlayMark() {
  return (
    <span className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-transform group-hover:scale-110">
      <svg viewBox="0 0 12 12" fill="currentColor" className="ml-0.5 h-4 w-4" aria-hidden="true">
        <path d="M3 1.8v8.4L10 6 3 1.8z" />
      </svg>
    </span>
  );
}

/** 프로젝트가 하나뿐일 때: 표지를 크게 쓰는 단독 레이아웃 */
function Spotlight({ project, t }: { project: LabProject; t: Translate }) {
  const key = `projects.${project.slug}`;
  const tags = t.raw(`${key}.tags`) as string[];
  return (
    <Link
      href={`/lab/${project.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-colors hover:border-primary/40 lg:grid-cols-5"
    >
      <div className="relative aspect-video overflow-hidden bg-black lg:col-span-3 lg:aspect-auto lg:min-h-96">
        <Image
          src={project.cover}
          alt={t(`${key}.coverAlt`)}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
        {project.video && <PlayMark />}
      </div>
      <div className="flex flex-col justify-center gap-5 p-8 lg:col-span-2 lg:p-10">
        <LabStatusBadge status={project.status} label={t(`status.${project.status}`)} />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t(`${key}.name`)}</h2>
          <p className="mt-2 text-lg text-primary">{t(`${key}.tagline`)}</p>
        </div>
        <p className="leading-relaxed text-muted">{t(`${key}.summary`)}</p>
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag} className="rounded-md border border-border px-2.5 py-1 text-xs text-muted">
              {tag}
            </li>
          ))}
        </ul>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {t("list.viewProject")}
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
            <path d="M4 2L8 6L4 10" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/** 프로젝트가 둘 이상일 때: 카드 그리드 */
function ProjectCard({ project, t }: { project: LabProject; t: Translate }) {
  const key = `projects.${project.slug}`;
  const tags = t.raw(`${key}.tags`) as string[];
  return (
    <Link
      href={`/lab/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        <Image
          src={project.cover}
          alt={t(`${key}.coverAlt`)}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {project.video && <PlayMark />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <LabStatusBadge status={project.status} label={t(`status.${project.status}`)} />
        <h2 className="text-xl font-bold">{t(`${key}.name`)}</h2>
        <p className="flex-1 text-sm leading-relaxed text-muted">{t(`${key}.summary`)}</p>
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lab" });

  return (
    <>
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-primary">{t("hero.eyebrow")}</p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{t("hero.title")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t("hero.desc")}</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {labProjects.length === 1 ? (
            <Spotlight project={labProjects[0]} t={t} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {labProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LabCta t={t} />
    </>
  );
}
