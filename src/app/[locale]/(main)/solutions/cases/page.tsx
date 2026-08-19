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
      /* 둘 다 선택 필드다. 여기서 필수로 선언하면 t.raw 캐스트가
         실제 데이터에 대해 거짓말을 하고, 타입 검사가 무력화된다. */
      images?: string[];
      link?: string;
    };
  }>;
  const stats = t.raw("cases.stats") as Array<{ value: string; label: string }>;

  return <CasesContent cases={cases} stats={stats} />;
}
