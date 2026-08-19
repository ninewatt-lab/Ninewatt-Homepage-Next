import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { ServicesContent } from "./ServicesContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solutions" });
  return buildMetadata({
    locale,
    path: "/solutions/services",
    title: t("meta.services.title"),
    description: t("meta.services.description"),
  });
}

export default async function ServicesPage() {
  const t = await getTranslations("solutions");
  const projects = t.raw("services.projects") as Array<{
    client: string;
    period: string;
    title: string;
    detail?: {
      description: string;
      /* 둘 다 선택 필드다. 스크린샷이나 링크가 없는 사업이 있고,
         여기서 필수로 선언하면 t.raw 캐스트가 실제 데이터에 대해 거짓말을 한다. */
      images?: string[];
      link?: string;
    };
  }>;

  return <ServicesContent projects={projects} />;
}
