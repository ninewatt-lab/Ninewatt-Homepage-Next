import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Opti - AI 대화형 건물 에너지 분석 서비스 - Ninewatt",
  description: "CES 2026 Innovation Awards Honoree. Opti는 AI 대화형 건물 에너지 분석 서비스입니다.",
};

const features = [
  {
    title: "에너지 분석",
    description: "도메인 특화 LLM(RAG) 기반 건물 에너지 사용량 분석 및 인사이트 제공",
  },
  {
    title: "자동 리포트",
    description: "운영 데이터를 기반으로 한 자동 에너지 분석 리포트 생성",
  },
  {
    title: "이상 감지",
    description: "AI 기반 이상 상황 원인 분석 및 실시간 알림 지원",
  },
  {
    title: "대화형 인터페이스",
    description: "자연어 질의를 통한 직관적인 에너지 관리 인터페이스",
  },
  {
    title: "에너지 절약 추론",
    description: "인공지능 모델 기반 건물의 에너지 사용량 및 절약 방법 추론",
  },
  {
    title: "벤치마크 분석",
    description: "유사 건물 대비 에너지 사용 현황 비교 및 개선 방향 제시",
  },
];

export default function OptiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-primary to-blue-700 px-6 py-32 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            CES Innovation Awards 2026 Honoree
          </p>
          <h1 className="mt-6 text-5xl font-bold md:text-7xl">Opti</h1>
          <p className="mt-4 text-xl text-white/80 md:text-2xl">
            AI 대화형 건물 에너지 분석 서비스
          </p>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/70">
            Opti는 CES Innovation Awards 2026 스마트 커뮤니티 부문 수상(Honoree)을 통해
            글로벌 무대에서의 경쟁력을 다시 한 번 입증했습니다.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            데모 요청하기
          </Link>
        </div>
      </section>

      {/* Award Badge */}
      <section className="border-b border-gray-100 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-indigo-900 text-white">
            <div className="text-center">
              <p className="text-xs font-bold">CES</p>
              <p className="text-lg font-bold">2026</p>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">CES Innovation Awards&reg; 2026 Honoree</p>
            <p className="text-sm text-foreground/60">
              Opti: AI Energy Advisor for Buildings — Smart Communities Category
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-bold">주요 기능</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 p-6 transition-all hover:border-primary/20 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold">이렇게 작동합니다</h2>
          <div className="mt-12 space-y-8">
            {[
              { step: "01", title: "데이터 연동", desc: "건물 에너지 데이터를 플랫폼에 연결합니다. BMS, IoT 센서, 전력 데이터 등 다양한 소스를 지원합니다." },
              { step: "02", title: "AI 분석", desc: "도메인 특화 LLM이 에너지 사용 패턴을 분석하고, 이상 징후를 감지하며, 최적화 방안을 도출합니다." },
              { step: "03", title: "대화형 인사이트", desc: "자연어로 질문하면 즉시 에너지 관련 인사이트를 제공합니다. 복잡한 대시보드 없이도 핵심 정보에 접근할 수 있습니다." },
              { step: "04", title: "자동 리포트", desc: "정기적으로 에너지 사용 현황과 개선 제안을 포함한 리포트를 자동 생성합니다." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Opti를 직접 경험해보세요</h2>
          <p className="mt-4 text-white/70">
            데모를 통해 Opti가 어떻게 건물 에너지 관리를 혁신하는지 확인하세요.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            데모 요청하기
          </Link>
        </div>
      </section>
    </>
  );
}
