import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * AI 크롤러는 학습·인용 모두 허용한다(2026-07 결정).
 * 노출이 곧 영업 자산인 단계라 학습 차단의 실익이 작다고 판단.
 * 정책을 바꿀 경우 docs/seo-improvement-plan.md §11.2의 통크롤러 목록 참조.
 *
 * Payload CMS 도입 시 disallow에 "/admin/"을 추가할 것.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
