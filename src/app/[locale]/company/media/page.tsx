import { getMedia } from "@/lib/cms";
import MediaContent from "./MediaSection";

export async function generateMetadata() {
  return {
    title: "Media - Ninewatt",
    description: "나인와트 관련 뉴스, 보도자료 및 영상 콘텐츠",
  };
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { news, videos } = await getMedia(locale);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Media</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            나인와트 관련 뉴스, 보도자료 및 영상 콘텐츠
          </p>
        </div>
      </section>

      <MediaContent news={news} videos={videos} />
    </>
  );
}
