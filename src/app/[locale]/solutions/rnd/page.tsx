import { getTranslations } from "next-intl/server";
import { RndContent } from "./RndContent";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: "R&D 과제 - Ninewatt",
    description: t("rnd.subtitle"),
  };
}

export default function RndPage() {
  return <RndContent />;
}
