import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GreenPlanner - Ninewatt",
  description: "도시 단위 건물 에너지 진단 및 그린리모델링 시뮬레이션 플랫폼",
};

export default function GreenPlannerPage() {
  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold text-primary">GreenPlanner</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-7xl">GreenPlanner</h1>
        <p className="mt-4 text-xl text-muted">Green Remodeling Planner</p>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
          도시 단위 건물 에너지 진단 및 그린리모델링 시뮬레이션 플랫폼.
          상세 페이지가 곧 공개됩니다.
        </p>
        <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
          Coming Soon
        </div>
      </div>
    </section>
  );
}
