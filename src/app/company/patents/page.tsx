import type { Metadata } from "next";
import { domesticPatents, internationalPatents } from "@/data/patents";
import { certifications } from "@/data/certifications";

export const metadata: Metadata = {
  title: "특허 & 인증 - Ninewatt",
  description: "나인와트 특허 및 인증 내역. 33건 이상의 특허 보유",
};

const domesticRegistered = domesticPatents.filter((p) => p.status === "등록");
const domesticPending = domesticPatents.filter((p) => p.status === "출원");

export default function PatentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">특허 & 인증</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            에너지 AI 기술 분야의 핵심 지식재산권을 보유하고 있습니다
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div>
              <dt className="text-muted">총 보유 특허</dt>
              <dd className="text-2xl font-bold">33</dd>
            </div>
            <div>
              <dt className="text-muted">국내 특허</dt>
              <dd className="text-2xl font-bold">{domesticPatents.length}</dd>
            </div>
            <div>
              <dt className="text-muted">해외 특허 (PCT)</dt>
              <dd className="text-2xl font-bold">{internationalPatents.length}</dd>
            </div>
            <div>
              <dt className="text-muted">인증 내역</dt>
              <dd className="text-2xl font-bold">{certifications.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Domestic Patents - Registered */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            국내 특허 — 등록 <span className="text-muted">({domesticRegistered.length}건)</span>
          </h2>
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
          <div className="mt-16">
            <h2 className="text-xl font-bold">
              국내 특허 — 출원 <span className="text-muted">({domesticPending.length}건)</span>
            </h2>
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

          {/* International Patents */}
          <div className="mt-16">
            <h2 className="text-xl font-bold">
              해외 특허 <span className="text-muted">({internationalPatents.length}건)</span>
            </h2>
            <div className="mt-4 overflow-x-auto">
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
            인증 내역 <span className="text-muted">({certifications.length}건)</span>
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
