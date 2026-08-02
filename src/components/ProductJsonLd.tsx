import { getLocale, getTranslations } from "next-intl/server";
import JsonLd from "./JsonLd";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

/**
 * 제품 상세 페이지용 Product + BreadcrumbList.
 *
 * 이름·설명은 Sprint 1에서 만든 meta 블록을 그대로 쓴다. 문안이 개선되면
 * 구조화 데이터도 같이 따라가므로 두 곳을 관리할 필요가 없다.
 *
 * locale은 params 대신 getLocale()로 받는다. 제품 페이지 대부분이
 * params를 받지 않는 시그니처라 호출부를 건드리지 않기 위해서다.
 */
export default async function ProductJsonLd({
  path,
  metaKey,
  category,
}: {
  /** 로케일 제외 경로 (예: "/product/bems") */
  path: string;
  /** product 네임스페이스의 meta 키 (예: "meta.bems") */
  metaKey: string;
  /** schema.org category. 로케일 간 일관성을 위해 영문으로 통일 */
  category?: string;
}) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "product" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const name = t(`${metaKey}.title`);
  const description = t(`${metaKey}.description`);

  return (
    <>
      <JsonLd data={productJsonLd({ locale, path, name, description, category })} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: "Ninewatt", path: "/" },
          { name: tc("nav.product"), path: "/product" },
          { name, path },
        ])}
      />
    </>
  );
}
