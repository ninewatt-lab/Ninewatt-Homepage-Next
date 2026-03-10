import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RE:park - Ninewatt",
  description: "신재생·분산에너지 시뮬레이션 및 설치 최적화 플랫폼",
};

export default function REparkPage() {
  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold text-primary">RE:park</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-7xl">RE:park</h1>
        <p className="mt-4 text-xl text-muted">Renewable Energy Park</p>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
          신재생·분산에너지 시뮬레이션 및 설치 최적화 플랫폼.
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
