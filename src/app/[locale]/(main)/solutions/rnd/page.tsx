import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { getRndProjects } from "@/lib/cms";
import { localizeOrg } from "@/lib/orgNames";
import { getRndText, localizeBudget } from "@/lib/rndProjectText";
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

  const rndProjects = projects.map((p) => {
    // ko 외 로케일의 과제명 · 연구목표 · 연구내용 · 사업구분 (사전에 없으면 원문)
    const text = getRndText(p.research, locale);
    return {
      agency: localizeOrg(p.agency, locale),
      research: text?.research ?? p.research,
      lead: localizeOrg(p.lead, locale),
      period: p.period,
      status: p.status as "수행중" | "완료",
      // goal이 아니라 detail 존재로 판단한다. 출처(연구과제 xlsx)에 사업비·소관부처·
      // 사업구분은 있지만 연구목표·연구내용이 없는 과제가 있고, goal로 게이트하면
      // 가진 데이터까지 통째로 버려진다. 빈 goal은 RndContent가 알아서 숨긴다.
      detail: p.detail
        ? {
            goal: text?.goal ?? p.detail.goal ?? "",
            contents:
              text?.contents ??
              ((p.detail.contents ?? []) as Array<{ item?: string | null } | string>).map((c) =>
                typeof c === "string" ? c : (c as { item?: string | null }).item ?? ""
              ),
            budget: localizeBudget(p.detail.budget ?? "", locale),
            department: localizeOrg(p.detail.department ?? "", locale),
            category: text?.category ?? p.detail.category ?? "",
            images: (p.detail as Record<string, unknown>).images as string[] | undefined,
            link: (p.detail as Record<string, unknown>).link as string | undefined,
          }
        : undefined,
    };
  });

  return <RndContent projects={rndProjects} />;
}
