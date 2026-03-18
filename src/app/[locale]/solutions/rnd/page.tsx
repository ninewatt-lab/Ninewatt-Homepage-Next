import { getTranslations } from "next-intl/server";
import { getRndProjects } from "@/lib/cms";
import { RndContent } from "./RndContent";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: "R&D 과제 - Ninewatt",
    description: t("rnd.subtitle"),
  };
}

export default async function RndPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { docs: projects } = await getRndProjects(locale);

  const rndProjects = projects.map((p) => ({
    agency: p.agency,
    research: p.research,
    lead: p.lead,
    period: p.period,
    status: p.status as "수행중" | "완료",
    detail: p.detail?.goal
      ? {
          goal: p.detail.goal,
          contents: ((p.detail.contents ?? []) as Array<{ item?: string | null } | string>).map((c) =>
            typeof c === "string" ? c : (c as { item?: string | null }).item ?? ""
          ),
          budget: p.detail.budget ?? "",
          department: p.detail.department ?? "",
          category: p.detail.category ?? "",
        }
      : undefined,
  }));

  return <RndContent projects={rndProjects} />;
}
