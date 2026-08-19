import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { getRndProjects } from "@/lib/cms";
import { RndContent } from "./RndContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solutions" });
  return buildMetadata({
    locale,
    path: "/solutions/rnd",
    title: t("meta.rnd.title"),
    description: t("meta.rnd.description"),
  });
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
    // goal이 아니라 detail 존재로 판단한다. 출처(연구과제 xlsx)에 사업비·소관부처·
    // 사업구분은 있지만 연구목표·연구내용이 없는 과제가 있고, goal로 게이트하면
    // 가진 데이터까지 통째로 버려진다. 빈 goal은 RndContent가 알아서 숨긴다.
    detail: p.detail
      ? {
          goal: p.detail.goal ?? "",
          contents: ((p.detail.contents ?? []) as Array<{ item?: string | null } | string>).map((c) =>
            typeof c === "string" ? c : (c as { item?: string | null }).item ?? ""
          ),
          budget: p.detail.budget ?? "",
          department: p.detail.department ?? "",
          category: p.detail.category ?? "",
          images: (p.detail as Record<string, unknown>).images as string[] | undefined,
          link: (p.detail as Record<string, unknown>).link as string | undefined,
        }
      : undefined,
  }));

  return <RndContent projects={rndProjects} />;
}
