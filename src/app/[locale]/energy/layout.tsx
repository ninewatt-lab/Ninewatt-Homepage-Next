import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import EnergyHeader from "@/components/energy/EnergyHeader";
import EnergyFooter from "@/components/energy/EnergyFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "energy" });
  return {
    title: {
      default: t("metadata.title"),
      template: `%s | 나인와트 에너지`,
    },
    description: t("metadata.description"),
  };
}

export default function EnergyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EnergyHeader />
      <main className="pt-16">{children}</main>
      <EnergyFooter />
    </>
  );
}
