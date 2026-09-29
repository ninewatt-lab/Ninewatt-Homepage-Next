import type { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** "lab" 네임스페이스로 받은 번역 함수 */
export type LabTranslate = Awaited<ReturnType<typeof getTranslations>>;

/** Lab 목록·상세 공통 하단 CTA. 독자가 정해지기 전이라 협업과 채용을 나란히 둔다 */
export default function LabCta({ t }: { t: LabTranslate }) {
  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold">{t("cta.title")}</h2>
        <p className="mt-3 max-w-2xl text-base text-muted">{t("cta.desc")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {t("cta.collab")}
          </Link>
          <Link
            href="/company/career"
            className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
          >
            {t("cta.join")}
          </Link>
        </div>
      </div>
    </section>
  );
}
