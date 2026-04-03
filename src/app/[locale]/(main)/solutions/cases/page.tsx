import { getTranslations } from "next-intl/server";
import { CasesContent } from "./CasesContent";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: `${t("cases.title")} - Ninewatt`,
    description: t("cases.subtitle"),
  };
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
