import { companyInfo } from "@/data/companyInfo";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * 구조화 데이터(JSON-LD) 빌더.
 *
 * 값은 반드시 src/data/* 를 출처로 쓴다. Footer 표기와 한 글자라도 다르면
 * 검색엔진이 엔티티를 별개로 인식해 신뢰 신호가 깎인다.
 */

/** 회사 엔티티. 레이아웃에서 전 페이지에 한 번만 렌더한다. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "나인와트",
    alternateName: ["Ninewatt", "주식회사 나인와트"],
    url: SITE_URL,
    email: companyInfo.email,
    telephone: `+82-${companyInfo.phone.replace(/^0/, "")}`,
    foundingDate: "2019",
    description:
      "AI 기반 건물·에너지 데이터 분석으로 ESS 운영, 태양광 O&M, 건물에너지관리(BEMS)를 제공하는 에너지 기술 기업.",
    address: [
      {
        "@type": "PostalAddress",
        name: "본사",
        streetAddress: companyInfo.hqAddress,
        addressCountry: "KR",
      },
      {
        "@type": "PostalAddress",
        name: "R&D 센터",
        streetAddress: companyInfo.rndAddress,
        addressCountry: "KR",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+82-${companyInfo.phone.replace(/^0/, "")}`,
      email: companyInfo.email,
      areaServed: ["KR", "JP", "GB", "FR", "US"],
      availableLanguage: ["ko", "en", "ja", "fr"],
    },
    sameAs: companyInfo.socialLinks.map((s) => s.url),
  };
}

export type ProductJsonLdInput = {
  locale: string;
  /** 로케일을 제외한 경로 */
  path: string;
  name: string;
  description: string;
  /** 제품 분류 (예: "에너지저장장치(ESS)") */
  category?: string;
};

/**
 * 제품 엔티티.
 *
 * 가격을 공개하지 않으므로 Offer 대신 카테고리와 제조사만 기술한다.
 * 근거 없는 Offer/AggregateRating을 넣으면 리치 결과에서 거부되고
 * 스팸 신호가 된다.
 */
export function productJsonLd({
  locale,
  path,
  name,
  description,
  category,
}: ProductJsonLdInput) {
  const url = absoluteUrl(locale, path);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    description,
    url,
    ...(category ? { category } : {}),
    brand: { "@type": "Brand", name: "Ninewatt" },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * 빵부스러기. 검색결과에 경로가 표시되어 클릭률이 오른다.
 * items 는 루트부터 현재 페이지까지 순서대로.
 */
export function breadcrumbJsonLd(
  locale: string,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}
