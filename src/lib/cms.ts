import { awards } from "@/data/awards";
import { certifications } from "@/data/certifications";
import { history } from "@/data/history";
import { domesticPatents, internationalPatents } from "@/data/patents";
import { trademarks } from "@/data/trademarks";
import { technologyTransfers } from "@/data/technologyTransfers";
import { rndProjects } from "@/data/rndProjects";
import { companyInfo } from "@/data/companyInfo";
import { homeStats } from "@/data/homeStats";
import { executives } from "@/data/executives";
import { organization } from "@/data/organization";
import { career } from "@/data/career";
import { globalBusiness } from "@/data/globalBusiness";
import { products } from "@/data/products";
import { newsArticles, videos, type MediaItem } from "@/data/media";
import { fromSheet } from "@/lib/sheet";
import { parseMediaRow } from "@/lib/media-schema";
import { papers } from "@/data/papers";

// Collections

export async function getPapers(_locale: string) {
  const sorted = [...papers].sort((a, b) => b.year - a.year);
  return { docs: sorted };
}

export async function getAwards(_locale: string) {
  const sorted = [...awards].sort((a, b) => b.year - a.year);
  return { docs: sorted };
}

export async function getCertifications(_locale: string) {
  return { docs: certifications };
}

export async function getTrademarks(_locale: string) {
  return { docs: trademarks };
}

export async function getHistory(_locale: string) {
  const sorted = [...history].sort((a, b) => b.year - a.year);
  return { docs: sorted };
}

interface PatentDoc {
  id: number;
  type: "domestic" | "international";
  status: string;
  date: string;
  number: string;
  title: string;
  titleEn?: string;
  applicant: string;
  country?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  googlePatentsPending?: boolean;
}

function generateImageUrls(thumbnailUrl: string | undefined, pageCount: number | undefined): string[] | undefined {
  if (!thumbnailUrl || !pageCount) return undefined;
  const pagesBase = thumbnailUrl.replace("/thumbnails/", "/pages/").replace(/\.jpg$/, "");
  // pdftoppm pads based on total pages: 1-9 pages → "page-1", 10-99 → "page-01", 100+ → "page-001"
  const digits = pageCount >= 100 ? 3 : pageCount >= 10 ? 2 : 1;
  return Array.from({ length: pageCount }, (_, i) => {
    const num = String(i + 1).padStart(digits, "0");
    return `${pagesBase}/page-${num}.jpg`;
  });
}

export async function getPatents(_locale: string, type?: "domestic" | "international"): Promise<{ docs: PatentDoc[] }> {
  const visibleDomestic = domesticPatents.filter((p) => p.visible !== false);
  const domestic: PatentDoc[] = visibleDomestic.map((p) => ({
    ...p,
    type: "domestic" as const,
    imageUrls: generateImageUrls(p.thumbnailUrl, p.pageCount),
  }));
  const international: PatentDoc[] = internationalPatents.map((p) => ({
    id: p.id,
    type: "international" as const,
    status: p.status,
    date: p.date,
    number: p.number,
    title: p.titleKo,
    titleEn: p.titleEn,
    applicant: p.applicant,
    country: p.country,
    thumbnailUrl: p.thumbnailUrl,
  }));

  let docs: PatentDoc[];
  if (type === "domestic") {
    docs = domestic;
  } else if (type === "international") {
    docs = international;
  } else {
    docs = [...domestic, ...international];
  }

  docs.sort((a, b) => b.date.localeCompare(a.date));
  return { docs };
}

export async function getTechnologyTransfers(_locale: string) {
  const sorted = [...technologyTransfers].sort((a, b) => b.transferDate.localeCompare(a.transferDate));
  return { docs: sorted };
}

export async function getPartners(_locale: string) {
  return { docs: [] };
}

export async function getRndProjects(_locale: string) {
  return { docs: rndProjects };
}

// Globals

export async function getCompanyInfo(_locale: string) {
  return companyInfo;
}

export async function getHomeStats(_locale: string) {
  return homeStats;
}

export async function getExecutives(_locale: string) {
  return executives;
}

export async function getOrganization(_locale: string) {
  return organization;
}

export async function getCareer(_locale: string) {
  return career;
}

export async function getGlobalBusiness(_locale: string) {
  return globalBusiness;
}

export async function getProducts() {
  return products;
}

export async function getProductServiceUrl(slug: string): Promise<string | null> {
  const product = products.items.find((item) => item.slug === slug);
  return product?.serviceUrl || null;
}

/* ── Media (뉴스·영상) ──────────────────────────────────────────────
   src/data 중 유일하게 시트를 소스로 쓰는 컬렉션이다. 나머지는 아직 정적이며,
   여기서 검증된 방식을 awards → history → papers 순으로 넓힐 계획이다.
   자세한 판단 기준은 docs/content-sheet-guide.md 의 "다음 컬렉션" 절 참고. */

/**
 * 보도자료는 국문 원문이라 로케일별 번역본이 없다.
 * ko가 아니면 title_en이 있을 때만 영문 제목으로 바꾼다 — ja/fr 독자에게도
 * 국문 제목보다는 영문 제목이 낫고, 없으면 원문을 그대로 둔다.
 */
function localizeMedia(items: MediaItem[], locale: string): MediaItem[] {
  if (locale === "ko") return items;
  return items.map((item) => (item.titleEn ? { ...item, title: item.titleEn } : item));
}

export async function getMedia(locale: string) {
  const items = await fromSheet<MediaItem>({
    url: process.env.MEDIA_SHEET_CSV_URL,
    tag: "media",
    fallback: [...newsArticles, ...videos],
    parseRow: parseMediaRow,
  });

  // 같은 링크를 두 번 붙여넣는 실수를 흡수한다(MediaSection이 link를 React key로 쓴다).
  // 시트에서 위에 있는 행이 이긴다 — 편집자가 먼저 보는 행이 남아야 납득이 된다.
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
  const localized = localizeMedia(unique, locale);
  const byDateDesc = (a: MediaItem, b: MediaItem) => b.date.localeCompare(a.date);

  return {
    news: localized.filter((i) => i.type === "article").sort(byDateDesc),
    videos: localized.filter((i) => i.type === "video").sort(byDateDesc),
  };
}
