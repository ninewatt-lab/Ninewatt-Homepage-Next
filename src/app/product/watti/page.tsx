import type { Metadata } from "next";
import Link from "next/link";
import { ProductTrackRecord, type TrackRecordItem } from "@/components/ProductTrackRecord";

export const metadata: Metadata = {
  title: "Watti - 3D 건물 에너지 분석 플랫폼 - Ninewatt",
  description:
    "3D 맵 기반 건물 에너지 분석 플랫폼. 건축물·에너지·환경·도시 데이터 분석을 통해 건물 에너지 효율화 인사이트를 제공합니다.",
};

const trackRecord: TrackRecordItem[] = [
  { year: 2019, type: "사업화", name: "SW융합 맞춤형 글로벌 지원사업", period: "2019.10~2019.12", org: "인천테크노파크" },
  { year: 2019, type: "사업화", name: "TIPS 해외마케팅 지원사업 — 민관공동 창업자 발굴육성", period: "2019.08~2020.07", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2021, type: "R&D", name: "AI기반 에너지 재난대응 플랫폼 개발 (인공지능중심산업융합집적단지조성)", period: "2021.01~2023.12", department: "과학기술정보통신부", org: "서울대학교 산학협력단" },
  { year: 2021, type: "R&D", name: "클라우드 기반 에너지 진단솔루션 SaaS 전환 (핵심산업 클라우드 플래그십)", period: "2021.05~2021.12", department: "과학기술정보통신부", org: "정보통신산업진흥원" },
  { year: 2022, type: "R&D", name: "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스", period: "2022.04~2025.03", department: "중소벤처기업부" },
  { year: 2022, type: "R&D", name: "그린리모델링 효율향상을 위한 디지털진단 모듈화 기술", period: "2022.04~2024.12", department: "국토교통부", org: "국토교통과학기술진흥원" },
  { year: 2022, type: "사업화", name: "그린벤처 프로그램 사업화", period: "2022.04~2025.03", department: "중소벤처기업부" },
  { year: 2022, type: "지원사업", name: "인천서구강소특구 특화성장패키지", period: "2022.12~2023.05", org: "연구개발특구진흥재단" },
  { year: 2022, type: "지원사업", name: "서울창업허브 대기업 협력 프로그램 (LS일렉트릭)", period: "2022.09~2023.02", org: "서울산업진흥원" },
  { year: 2023, type: "R&D", name: "건물에너지 소비 데이터 통합관리 기반 구축", period: "2023.04~2026.12", department: "국토교통부", org: "한국건설기술연구원" },
  { year: 2023, type: "지원사업", name: "강남구청 실증 지원사업", period: "2023.07~2023.12", org: "창업진흥원" },
  { year: 2023, type: "PoC", name: "KSC 데이터 기반 건물에너지 성능진단 및 그린리모델링 솔루션", period: "2023.06~2023.11", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2023, type: "PoC", name: "서울 스마트도시 솔루션 해외(런던) 실증", period: "2023.12~2024.12", org: "서울디지털재단" },
  { year: 2023, type: "지원사업", name: "스케일업 챌린지랩 (글로벌 진출)", period: "2023.04~2023.11", org: "인천테크노파크" },
  { year: 2024, type: "R&D", name: "도시 건물 넷 제로 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발", period: "2024.07~2027.04", department: "국토교통부", org: "국토교통과학기술진흥원" },
  { year: 2024, type: "지원사업", name: "글로벌 기업 협업 프로그램 — ChatGPT 기반 건물 전력사용량 예측 및 ESS 최적 제어", period: "2024.05~2024.12", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2024, type: "PoC", name: "해외실증(PoC) 지원 프로그램", period: "2024.05~2024.11", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2025, type: "지원사업", name: "그린벤처 유망기업 글로벌 진출지원 프로그램", department: "중소벤처기업부" },
];

const caseStudies = [
  {
    title: "런던 QEOP",
    location: "London, UK",
    description:
      "Queen Elizabeth Olympic Park 내 건물 대상으로 3D 에너지맵을 구축. 건물 에너지 소비량 모니터링과 효율 평가, 개선 컨설팅 레포트를 제공했습니다.",
  },
  {
    title: "강남구 Zero Carbon Map",
    location: "서울 강남구",
    description:
      "국내 최초 자치구 3D 에너지맵 구축. 법정동별 탄소배출량 가시화와 건물별 전기·가스 사용량 분석으로 탄소중립 도시 계획의 정량적 근거를 마련했습니다.",
  },
  {
    title: "경기도 공간정보 시스템",
    location: "경기도",
    description:
      "기후·에너지 데이터포털을 구축하고, 그린리모델링 대상 건물 선별, 유휴부지 태양광 적지분석, 친환경차 충전소 설치 지원 등 정책 기획에 참여했습니다.",
  },
];

export default function WattiPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Open Data-Based Platform
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Watti
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            3D 맵 기반 건물 에너지 분석 플랫폼
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            건축물·에너지·환경·도시 데이터를 3D 지도 위에서 통합 분석합니다.
            데이터 종류와 분석모듈을 커스텀하여 고객 니즈에 맞는 플랫폼을 구축합니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              데모 요청하기
            </Link>
            <a
              href="/files/NINEWATT_WATTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* Product Video */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl">
          <video
            className="h-auto w-full rounded-2xl"
            autoPlay
            loop
            muted
            playsInline
          >
            <source
              src="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/watti-scene.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      {/* Big data stat — single number, not a section */}
      <section className="border-b border-border px-6 py-12">
        <div className="mx-auto flex max-w-5xl items-baseline gap-3">
          <span className="text-4xl font-bold text-primary">134,000건+</span>
          <span className="text-muted">공간 빅데이터 통합</span>
        </div>
      </section>

      {/* What Watti does — two column asymmetric */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-5">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold">핵심 역량</h2>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                대규모 데이터 통합과 AI 분석, 커스텀 SaaS 환경을 제공합니다.
              </p>
            </div>
            <div className="md:col-span-3 space-y-6">
              {[
                {
                  title: "분석모듈",
                  items: [
                    "에너지 분석 — 건물 에너지 효율 평가, 시뮬레이션, 리모델링 경제성 분석",
                    "탄소 분석 — 도시·건물 탄소 배출 모니터링, 감축 시나리오, 수목 탄소흡수량 반영",
                    "태양광 분석 — 건물 지붕·입면 일사 분석, 최적 설치 위치, 경제성 분석",
                    "전기차 분석 — 충전소 현황 모니터링, 최적 설치 위치 선별",
                  ],
                },
                {
                  title: "데이터 종류",
                  items: [
                    "Energy — 건물 전기/가스 사용량, 1차 에너지 소요량, 온실가스배출량",
                    "Sustainability — 그린리모델링 대상 건축물, 에너지효율등급, 녹색건축인증",
                    "Weather — 기온, 습도, 일사, 일조, 강수량, 침수 흔적",
                    "Social — 생활편의·문화체육·복지시설, 전기차 충전소",
                    "Demographic — 인구·세대현황, 유동·직장인구 추이, 고용동향",
                    "Real estate — 부동산 실거래가, 공동주택표준데이터",
                  ],
                },
              ].map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-muted leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Government use cases — inline, not card grid */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">지자체 활용</h2>
          <p className="mt-3 text-muted">
            가시화를 통한 인사이트 도출 및 도시개발 계획 근거 자료로 활용됩니다.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "지자체 온실가스 감축 목표 관리",
              "관할 건축물의 에너지 사용 현황 및 효율화 방안",
              "온실가스 감축 전략 시나리오 분석",
              "공공건축물 에너지/탄소 관리",
            ].map((item) => (
              <li key={item} className="border-l-2 border-primary pl-4 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case Studies — varied layout, not identical cards */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">구축 사례</h2>
          <div className="mt-10 space-y-10">
            {caseStudies.map((cs) => (
              <div key={cs.title} className="md:flex md:gap-8">
                <div className="mb-2 md:mb-0 md:w-48 shrink-0">
                  <h3 className="text-lg font-bold">{cs.title}</h3>
                  <p className="text-sm text-muted">{cs.location}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {cs.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record */}
      <ProductTrackRecord items={trackRecord} />

      {/* CTA */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Watti 도입 문의</h2>
            <p className="mt-2 text-muted">
              지자체·기업 맞춤 플랫폼 구축을 상담해 드립니다.
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              문의하기
            </Link>
            <a
              href="/files/NINEWATT_WATTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 브로셔
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
