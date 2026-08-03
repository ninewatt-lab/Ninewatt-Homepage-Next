import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { ENERGY_SITE_URL, SITE_URL, isEnergyHost } from "@/lib/seo";

/**
 * AI 크롤러는 학습·인용 모두 허용한다(2026-07 결정).
 * 노출이 곧 영업 자산인 단계라 학습 차단의 실익이 작다고 판단.
 * 정책을 바꿀 경우 docs/seo-improvement-plan.md §11.2의 통크롤러 목록 참조.
 *
 * sitemap·host는 요청 호스트에 맞춰 발급한다. 에너지 서브도메인이 메인 도메인을
 * 정식으로 선언하면, 내부 링크가 향하는 URL과 색인 대상이 어긋난다.
 *
 * Payload CMS 도입 시 disallow에 "/admin/"을 추가할 것.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  const origin = isEnergyHost(host) ? ENERGY_SITE_URL : SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
