import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: `${t("sharedEss.heroTitle")} - Shared ESS - Ninewatt`,
    description: t("sharedEss.heroDesc"),
  };
}

export default async function SharedEssPage() {
  const t = await getTranslations("product");
  const backgroundItems = t.raw("sharedEss.backgroundItems") as { title: string; desc: string }[];
  const conceptAdvantages = t.raw("sharedEss.conceptAdvantages") as { title: string; desc: string }[];
  const comparisonItems = t.raw("sharedEss.comparisonItems") as { category: string; individual: string; shared: string }[];
  const operationNormalItems = t.raw("sharedEss.operationNormalItems") as string[];
  const operationGridItems = t.raw("sharedEss.operationGridItems") as string[];
  const allianceMembers = t.raw("sharedEss.allianceMembers") as { name: string; role: string; items: string[] }[];
  const projectGoals = t.raw("sharedEss.projectGoals") as string[];
  const roadmapSteps = t.raw("sharedEss.roadmapSteps") as { phase: string; title: string; items: string[]; scale?: string }[];
  const impactItems = t.raw("sharedEss.impactItems") as { value: string; label: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">{t("sharedEss.heroLabel")}</p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            {t("sharedEss.heroTitle")}
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("sharedEss.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("sharedEss.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("sharedEss.requestDemo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.background")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            {t("sharedEss.backgroundDesc")}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {backgroundItems.map((item, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concept — What is Shared ESS */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.concept")}</h2>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
            {t("sharedEss.conceptDesc")}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {conceptAdvantages.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-elevated p-6">
                <h3 className="text-lg font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.comparison")}</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="pb-3 pr-6 text-left font-medium text-muted">{t("sharedEss.comparisonColCategory")}</th>
                  <th className="pb-3 pr-6 text-left font-medium text-muted">{t("sharedEss.comparisonColIndividual")}</th>
                  <th className="pb-3 text-left font-medium text-primary">{t("sharedEss.comparisonColShared")}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonItems.map((item, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-4 pr-6 font-medium">{item.category}</td>
                    <td className="py-4 pr-6 text-muted">{item.individual}</td>
                    <td className="py-4 font-medium">{item.shared}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Operation */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.operation")}</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-primary">{t("sharedEss.operationNormal")}</h3>
              <ul className="mt-4 space-y-3">
                {operationNormalItems.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">{t("sharedEss.operationGrid")}</h3>
              <ul className="mt-4 space-y-3">
                {operationGridItems.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NWAs & VNM */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold">{t("sharedEss.nwas")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t("sharedEss.nwasDesc")}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("sharedEss.vnm")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t("sharedEss.vnmDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.project")}</h2>
          <p className="mt-4 text-lg font-medium">{t("sharedEss.projectName")}</p>
          <p className="mt-2 text-sm text-muted">{t("sharedEss.projectParticipantsLabel")}: {t("sharedEss.projectParticipants")}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-primary">{t("sharedEss.projectGoalsLabel")}</h3>
              <ul className="mt-3 space-y-2">
                {projectGoals.map((goal, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary">{t("sharedEss.projectBuildLabel")}</h3>
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-border bg-surface-elevated p-4">
                  <p className="text-xs font-medium text-muted">H/W 구축</p>
                  <p className="mt-1 text-sm">{t("sharedEss.projectHw")}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated p-4">
                  <p className="text-xs font-medium text-muted">S/W 구축</p>
                  <p className="mt-1 text-sm">{t("sharedEss.projectSw")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alliance */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.alliance")}</h2>
          <p className="mt-3 text-sm text-muted">{t("sharedEss.allianceDesc")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allianceMembers.map((member, i) => (
              <div key={i} className="rounded-lg border border-border p-6">
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                <ul className="mt-4 space-y-1.5">
                  {member.items.map((item, j) => (
                    <li key={j} className="text-sm text-muted">· {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.impact")}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {impactItems.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("sharedEss.roadmap")}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {roadmapSteps.map((step, i) => (
              <div key={i} className="relative rounded-lg border border-border p-6">
                <p className="text-xs font-medium text-primary">{step.phase}</p>
                <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                {step.scale && (
                  <p className="mt-1 text-sm font-medium text-primary">{step.scale}</p>
                )}
                <ul className="mt-4 space-y-1.5">
                  {step.items.map((item, j) => (
                    <li key={j} className="text-sm text-muted">· {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("sharedEss.ctaTitle")}</h2>
            <p className="mt-2 text-muted">
              {t("sharedEss.ctaDesc")}
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("sharedEss.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
