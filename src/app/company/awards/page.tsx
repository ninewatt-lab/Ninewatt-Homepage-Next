import type { Metadata } from "next";
import { awards } from "@/data/awards";

export const metadata: Metadata = {
  title: "수상 내역 - Ninewatt",
  description: "나인와트 수상 내역. 에너지 기술 혁신으로 다수 수상",
};

const awardsByYear = awards.reduce(
  (acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  },
  {} as Record<number, typeof awards>,
);
const awardYears = Object.keys(awardsByYear)
  .map(Number)
  .sort((a, b) => b - a);

export default function AwardsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            수상 내역 <span className="text-muted">({awards.length}건)</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            에너지 기술 혁신을 인정받아 다수의 수상 실적을 보유하고 있습니다
          </p>
        </div>
      </section>

      {/* Awards List */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-10">
            {awardYears.map((year) => (
              <div key={year} className="flex gap-6">
                <div className="w-16 shrink-0 text-2xl font-bold text-primary">
                  {year}
                </div>
                <div className="space-y-3">
                  {awardsByYear[year].map((award) => (
                    <div key={award.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                      <span className="shrink-0 text-sm font-medium">
                        {award.name}
                      </span>
                      <span className="text-sm text-muted">
                        {award.organization} · {award.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
