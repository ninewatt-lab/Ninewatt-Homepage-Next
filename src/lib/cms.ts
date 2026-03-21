import { awards } from "@/data/awards";
import { certifications } from "@/data/certifications";
import { history } from "@/data/history";
import { domesticPatents, internationalPatents } from "@/data/patents";
import { rndProjects } from "@/data/rndProjects";
import { companyInfo } from "@/data/companyInfo";
import { homeStats } from "@/data/homeStats";
import { executives } from "@/data/executives";
import { organization } from "@/data/organization";
import { career } from "@/data/career";
import { globalBusiness } from "@/data/globalBusiness";
import { products } from "@/data/products";

// Collections

export async function getAwards(_locale: string) {
  const sorted = [...awards].sort((a, b) => b.year - a.year);
  return { docs: sorted };
}

export async function getCertifications(_locale: string) {
  return { docs: certifications };
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
  applicant: string;
  country?: string;
}

export async function getPatents(_locale: string, type?: "domestic" | "international"): Promise<{ docs: PatentDoc[] }> {
  const domestic: PatentDoc[] = domesticPatents.map((p) => ({
    ...p,
    type: "domestic" as const,
  }));
  const international: PatentDoc[] = internationalPatents.map((p) => ({
    id: p.id,
    type: "international" as const,
    status: p.status,
    date: p.date,
    number: p.number,
    title: p.titleKo,
    applicant: "",
    country: p.country,
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
