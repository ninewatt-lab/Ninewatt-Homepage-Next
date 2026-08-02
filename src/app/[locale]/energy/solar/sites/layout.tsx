import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

/* 이 라우트의 page.tsx가 "use client"라 generateMetadata를 export할 수 없다.
   Sprint 2에서 서버 컴포넌트로 전환하면 이 파일은 삭제하고 page.tsx로 옮길 것.
   하위 라우트가 없으므로 canonical 상속 문제는 발생하지 않는다. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solar" });
  return buildMetadata({
    locale,
    path: "/energy/solar/sites",
    title: t("meta.sites.title"),
    description: t("meta.sites.description"),
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
