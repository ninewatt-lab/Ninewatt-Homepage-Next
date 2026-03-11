import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "채용 안내 - Ninewatt",
  description:
    "나인와트 채용 안내. 함께 성장할 인재를 찾습니다. 조직 문화, 인재상, 복리후생, 채용 절차를 확인하세요.",
};

const values = [
  {
    title: "성장 욕구",
    desc: "목표 달성을 위해 지속적으로 발전하며, 스스로의 성장에 책임을 갖는 인재",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M2 20l4-4m0 0l4-4m-4 4l4 4m-4-4l-4-4" />
        <path d="M12 20V4m0 0l4 4m-4-4l-4 4" />
        <path d="M18 20V10m0 0l3 3m-3-3l-3 3" />
      </svg>
    ),
  },
  {
    title: "도전",
    desc: "긍정적인 사고방식을 가지고 새로운 기회에 적극적으로 참여하는 인재",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "행동력",
    desc: "자유로운 문화 속에서 업무를 주도적으로 추진하고 실행하는 인재",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M5 3l14 9-14 9V3z" />
      </svg>
    ),
  },
];

const benefits = [
  {
    category: "근무 환경",
    items: [
      { title: "자율 출근제", desc: "오전 8시~10시 중 10분 단위 자유 선택" },
      { title: "자유로운 연차", desc: "사전 승인 불필요, 10일 이상 장기휴가 권장" },
      { title: "근속연수별 연차", desc: "입사년도 월 1일, 차년도 연 15일" },
      { title: "생일자 유급휴가", desc: "연차 소진 없는 생일 휴가 제공" },
    ],
  },
  {
    category: "지원 & 보상",
    items: [
      { title: "식대 지원", desc: "식대 및 간식 제공" },
      { title: "건강검진", desc: "종합 건강검진 지원" },
      { title: "교육·도서 지원", desc: "직무 역량 향상비 및 자기개발 지원" },
      { title: "성과보상제", desc: "성과지표·프로젝트 기여도 연계 보상" },
      { title: "사무용품", desc: "노트북, 모니터 등 업무 장비 제공" },
    ],
  },
];

const steps = [
  { step: "01", title: "서류 지원", desc: "이력서 및 포트폴리오 제출" },
  { step: "02", title: "1차·2차 면접", desc: "직무 역량 및 문화 적합성 평가" },
  { step: "03", title: "최종 합격", desc: "처우 협의 및 입사 안내" },
];

export default function CareerPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">채용 안내</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            함께 성장하는 문화를 만들어갈 인재를 찾습니다
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Culture
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">조직 문화</h3>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            나인와트는 창의적이고 활동적인 조직 문화를 기반으로 개인과 기업이 함께 성장합니다.
            구성원의 도전과 성장을 적극 지원하고, 노력과 성과에 대한 보상을 보장합니다.
          </p>
        </div>
      </section>

      {/* Talent — 인재상 */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Talent
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">인재상</h3>
          <p className="mt-4 max-w-2xl text-muted">
            자유롭되 책임감을 갖고 함께 성장할 인재를 모집합니다
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {v.icon}
                </div>
                <h4 className="mt-4 text-lg font-semibold">{v.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — 복리후생 */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Benefits
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">복리후생</h3>

          <div className="mt-12 space-y-12">
            {benefits.map((group) => (
              <div key={group.category}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted/70">
                  {group.category}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border p-5"
                    >
                      <h5 className="font-semibold">{item.title}</h5>
                      <p className="mt-1 text-sm text-muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruit — 채용 절차 */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Recruit
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">채용 절차</h3>

          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-start">
            {steps.map((s, i) => (
              <div key={s.step} className="flex flex-1 items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden h-0.5 flex-1 self-center bg-border sm:block" />
                )}
                <div className="sm:mt-4">
                  <h4 className="font-semibold">{s.title}</h4>
                  <p className="mt-1 text-sm text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            나인와트와 함께할 준비가 되셨나요?
          </h3>
          <p className="mt-3 text-muted">
            채용 관련 문의는 아래 이메일로 연락해주세요
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:ninewatt@ninewatt.com"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M3 8l9 6 9-6" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>
              ninewatt@ninewatt.com
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
