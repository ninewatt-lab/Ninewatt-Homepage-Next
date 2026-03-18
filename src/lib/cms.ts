import { getPayloadClient } from "./payload";

// Collections

export async function getAwards(locale: string) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "awards",
    locale,
    sort: "-year",
    limit: 100,
  });
}

export async function getCertifications(locale: string) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "certifications",
    locale,
    sort: "sortOrder",
    limit: 100,
  });
}

export async function getHistory(locale: string) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "history",
    locale,
    sort: "-year",
    limit: 100,
  });
}

export async function getPatents(locale: string, type?: "domestic" | "international") {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "patents",
    locale,
    sort: "-date",
    limit: 100,
    where: type ? { type: { equals: type } } : {},
  });
}

export async function getPartners(locale: string) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "partners",
    locale,
    sort: "sortOrder",
    limit: 100,
  });
}

export async function getRndProjects(locale: string) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "rnd-projects",
    locale,
    limit: 100,
  });
}

// Globals

export async function getCompanyInfo(locale: string) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "company-info", locale });
}

export async function getHomeStats(locale: string) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "home-stats", locale });
}

export async function getExecutives(locale: string) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "executives", locale });
}

export async function getOrganization(locale: string) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "organization", locale });
}

export async function getCareer(locale: string) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "career", locale });
}

export async function getGlobalBusiness(locale: string) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "global-business", locale });
}

export async function getProducts() {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "products" });
}

export async function getProductServiceUrl(slug: string): Promise<string | null> {
  try {
    const data = await getProducts();
    const items = data.items as { slug: string; serviceUrl?: string }[] | undefined;
    const product = items?.find((item) => item.slug === slug);
    return product?.serviceUrl || null;
  } catch {
    return null;
  }
}
