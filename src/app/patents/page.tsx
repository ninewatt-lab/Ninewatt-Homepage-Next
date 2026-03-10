import type { Metadata } from "next";
import { domesticPatents, internationalPatents } from "@/data/patents";
import { certifications } from "@/data/certifications";

export const metadata: Metadata = {
  title: "특허 - Ninewatt",
  description: "나인와트 보유 특허 현황. 국내 23건, 해외 10건",
};

const domesticRegistered = domesticPatents.filter((p) => p.status === "등록");
const domesticPending = domesticPatents.filter((p) => p.status === "출원");

export default function PatentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">Intellectual Property</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">특허 & 인증</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            33건의 특허와 30건의 인증으로 입증된 기술력
          </p>
        </div>
      </section>

      {/* Patent Stats */}
      <section className="border-b border-border bg-surface px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">33</p>
            <p className="mt-1 text-sm text-muted">총 보유 특허</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">23</p>
            <p className="mt-1 text-sm text-muted">국내 특허</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">10</p>
            <p className="mt-1 text-sm text-muted">해외 특허 (PCT)</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">30</p>
            <p className="mt-1 text-sm text-muted">인증 내역</p>
          </div>
        </div>
      </section>

      {/* Domestic Patents */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Domestic Patents</p>
          <h2 className="mt-2 text-3xl font-bold">
            국내 특허 <span className="text-muted">({domesticPatents.length}건)</span>
          </h2>

          {/* Registered */}
          <h3 className="mt-10 text-lg font-semibold">
            등록 특허 <span className="text-muted">({domesticRegistered.length}건)</span>
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-3 font-semibold text-muted">No.</th>
                  <th className="py-3 pr-3 font-semibold text-muted">등록일</th>
                  <th className="py-3 pr-3 font-semibold text-muted">등록번호</th>
                  <th className="py-3 pr-3 font-semibold text-muted">특허명</th>
                  <th className="py-3 font-semibold text-muted">출원/등록자</th>
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
          <h3 className="mt-12 text-lg font-semibold">
            출원 특허 <span className="text-muted">({domesticPending.length}건)</span>
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-3 font-semibold text-muted">No.</th>
                  <th className="py-3 pr-3 font-semibold text-muted">출원일</th>
                  <th className="py-3 pr-3 font-semibold text-muted">출원번호</th>
                  <th className="py-3 pr-3 font-semibold text-muted">특허명</th>
                  <th className="py-3 font-semibold text-muted">출원자</th>
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
      </section>

      {/* International Patents */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">International Patents</p>
          <h2 className="mt-2 text-3xl font-bold">
            해외 특허 <span className="text-muted">({internationalPatents.length}건)</span>
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-3 font-semibold text-muted">No.</th>
                  <th className="py-3 pr-3 font-semibold text-muted">출원일</th>
                  <th className="py-3 pr-3 font-semibold text-muted">출원번호</th>
                  <th className="py-3 pr-3 font-semibold text-muted">특허명 (국문)</th>
                  <th className="py-3 pr-3 font-semibold text-muted">특허명 (영문)</th>
                  <th className="py-3 font-semibold text-muted">국가</th>
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
                    <td className="py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {p.country}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Certifications</p>
          <h2 className="mt-2 text-3xl font-bold">
            인증 내역 <span className="text-muted">({certifications.length}건)</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface-elevated p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {c.id}
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{c.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
