import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getMedia } from "@/lib/cms";
import { getTranslations } from "next-intl/server";
import MediaContent from "./MediaSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return buildMetadata({
    locale,
    path: "/company/media",
    title: t("meta.media.title"),
    description: t("meta.media.description"),
  });
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("company");
  const { news, videos } = await getMedia(locale);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("media.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("media.subtitle")}
          </p>
        </div>
      </section>

      <MediaContent news={news} videos={videos} />
    </>
  );
}
