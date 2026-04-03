import { getTranslations } from "next-intl/server";
import { ServicesContent } from "./ServicesContent";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: `${t("services.title")} - Ninewatt`,
    description: t("services.title"),
  };
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
