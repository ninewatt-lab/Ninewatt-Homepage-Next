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
import { newsArticles, videos } from "@/data/media";

// Collections

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
  const domestic: PatentDoc[] = domesticPatents.map((p) => ({
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
  return { docs: technologyTransfers };
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

export async function getMedia(_locale: string) {
  const sortedNews = [...newsArticles].sort((a, b) => b.date.localeCompare(a.date));
  const sortedVideos = [...videos].sort((a, b) => b.date.localeCompare(a.date));
  return { news: sortedNews, videos: sortedVideos };
}
