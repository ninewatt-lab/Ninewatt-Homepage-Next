import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { CasesContent } from "./CasesContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solutions" });
  return buildMetadata({
    locale,
    path: "/solutions/cases",
    title: t("meta.cases.title"),
    description: t("meta.cases.description"),
  });
}

export default async function CasesPage() {
  const t = await getTranslations("solutions");
  const cases = t.raw("cases.items") as Array<{
    title: string;
    category: string;
    desc: string;
    detail?: {
      description: string;
      images: string[];
      link: string;
    };
  }>;
  const stats = t.raw("cases.stats") as Array<{ value: string; label: string }>;

  return <CasesContent cases={cases} stats={stats} />;
}
