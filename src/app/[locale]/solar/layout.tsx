import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SolarHeader from "@/components/solar/SolarHeader";
import SolarFooter from "@/components/solar/SolarFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solar" });
  return {
    title: {
      default: t("metadata.title"),
      template: `%s | 나인와트 솔라`,
    },
    description: t("metadata.description"),
  };
}

export default function SolarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SolarHeader />
      <main className="pt-16">{children}</main>
      <SolarFooter />
    </>
  );
}
