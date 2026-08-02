import type { MetadataRoute } from "next";
import { ROUTES, absoluteUrl, localesFor } from "@/lib/seo";

/**
 * 라우트 정의는 src/lib/seo.ts의 ROUTES가 단일 출처다.
 * 번역이 존재하는 로케일만 나열하므로 URL 수는 (라우트수 × 4)가 아니다.
 *
 * lastModified는 의도적으로 생략했다. 빌드 시각을 넣으면 매 배포마다
 * 전 URL이 "수정됨"으로 표시되어 크롤 예산을 낭비하는 거짓 신호가 된다.
 * CMS 도입 후 콘텐츠 updatedAt을 쓰거나 git 커밋 시각을 빌드 시 주입할 것.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap(({ path, priority, freq }) => {
    const locales = localesFor(path);

    return locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      changeFrequency: freq,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, absoluteUrl(l, path)]),
        ),
      },
    }));
  });
}
