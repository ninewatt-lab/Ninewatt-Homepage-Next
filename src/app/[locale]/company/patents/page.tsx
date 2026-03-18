import { getTranslations } from "next-intl/server";
import { domesticPatents, internationalPatents } from "@/data/patents";
import { certifications } from "@/data/certifications";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: `${t("patents.title")} - Ninewatt`,
    description: t("patents.subtitle"),
  };
}

const domesticRegistered = domesticPatents.filter((p) => p.status === "등록");
const domesticPending = domesticPatents.filter((p) => p.status === "출원");

export default async function PatentsPage() {
  const t = await getTranslations("company");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("patents.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("patents.subtitle")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div>
              <dt className="text-muted">{t("patents.totalPatents")}</dt>
              <dd className="text-2xl font-bold">33</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.domestic")}</dt>
              <dd className="text-2xl font-bold">{domesticPatents.length}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.international")}</dt>
              <dd className="text-2xl font-bold">{internationalPatents.length}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.certifications")}</dt>
              <dd className="text-2xl font-bold">{certifications.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Domestic Patents - Registered */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            {t("patents.domesticRegistered")} <span className="text-muted">({domesticRegistered.length}건)</span>
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                  <th className="py-3 pr-3 font-semibold text-muted">{t("patents.regDate")}</th>
                  <th className="py-3 pr-3 font-semibold text-muted">{t("patents.regNo")}</th>
                  <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentName")}</th>
                  <th className="py-3 font-semibold text-muted">{t("patents.applicant")}</th>
                </tr>
              </thead>
              <tbody>
                {domesticRegistered.map((p, i) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3 pr-3 text-muted">{i + 1}</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-muted">{p.date}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-muted">{p.number}</td>
                    <td className="py-3 pr-3">{p.title}</td>
                    <td className="py-3 whitespace-nowrap text-muted">{p.applicant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pending */}
          <div className="mt-16">
            <h2 className="text-xl font-bold">
              {t("patents.domesticPending")} <span className="text-muted">({domesticPending.length}건)</span>
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-175 text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.appDate")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.appNo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentName")}</th>
                    <th className="py-3 font-semibold text-muted">{t("patents.applicant")}</th>
                  </tr>
                </thead>
                <tbody>
                  {domesticPending.map((p, i) => (
                    <tr key={p.id} className="border-b border-border">
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-muted">{p.date}</td>
                      <td className="py-3 pr-3 font-mono text-xs text-muted">{p.number}</td>
                      <td className="py-3 pr-3">{p.title}</td>
                      <td className="py-3 whitespace-nowrap text-muted">{p.applicant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* International Patents */}
          <div className="mt-16">
            <h2 className="text-xl font-bold">
              {t("patents.internationalPatents")} <span className="text-muted">({internationalPatents.length}건)</span>
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-200 text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.appDate")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.appNo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentNameKo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentNameEn")}</th>
                    <th className="py-3 font-semibold text-muted">{t("patents.country")}</th>
                  </tr>
                </thead>
                <tbody>
                  {internationalPatents.map((p, i) => (
                    <tr key={p.id} className="border-b border-border">
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-muted">{p.date}</td>
                      <td className="py-3 pr-3 font-mono text-xs text-muted">{p.number}</td>
                      <td className="py-3 pr-3">{p.titleKo}</td>
                      <td className="py-3 pr-3 text-muted">{p.titleEn}</td>
                      <td className="py-3 whitespace-nowrap text-muted">{p.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            {t("patents.certList")} <span className="text-muted">({certifications.length}건)</span>
          </h2>
          <div className="mt-6 space-y-3">
            {certifications.map((c) => (
              <div
                key={c.id}
                className="border-l-2 border-border pl-4"
              >
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-muted">{c.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
