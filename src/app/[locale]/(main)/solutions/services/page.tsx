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
      images: string[];
      link: string;
    };
  }>;

  return <ServicesContent projects={projects} />;
}
