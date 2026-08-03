import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { ROUTES, absoluteUrl, isEnergyHost, isEnergyPath, localesFor } from "@/lib/seo";

/**
 * 라우트 정의는 src/lib/seo.ts의 ROUTES가 단일 출처다.
 * 번역이 존재하는 로케일만 나열하므로 URL 수는 (라우트수 × 4)가 아니다.
 *
 * 호스트별로 자기 URL만 내보낸다:
 *   ninewatt.com/sitemap.xml        → /energy/* 를 제외한 본 사이트
 *   energy.ninewatt.com/sitemap.xml → 에너지 사업부(공개 URL은 /energy 접두사 없음)
 * 한 사이트맵에 두 호스트를 섞으면 Search Console 교차 제출 검증이 필요해진다.
 * 호스트를 읽으므로 이 라우트는 동적이다(응답이 작아 비용은 무시할 수준).
 *
 * lastModified는 의도적으로 생략했다. 빌드 시각을 넣으면 매 배포마다
 * 전 URL이 "수정됨"으로 표시되어 크롤 예산을 낭비하는 거짓 신호가 된다.
 * CMS 도입 후 콘텐츠 updatedAt을 쓰거나 git 커밋 시각을 빌드 시 주입할 것.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host");
  const wantEnergy = isEnergyHost(host);

  return ROUTES.filter(({ path }) => isEnergyPath(path) === wantEnergy).flatMap(
    ({ path, priority, freq }) => {
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
    },
  );
}
