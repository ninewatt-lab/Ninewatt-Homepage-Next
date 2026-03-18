"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface RndProject {
  agency: string;
  research: string;
  lead: string;
  period: string;
  status: "수행중" | "완료";
  detail?: {
    goal: string;
    contents: string[];
    budget: string;
    department: string;
    category: string;
  };
}

const rndProjects: RndProject[] = [
  {
    agency: "중소기업기술정보진흥원",
    research: "빅데이터분석 기반 에너지절감 AI플랫폼 개발",
    lead: "나인와트",
    period: "21.07~21.12",
    status: "완료",
    detail: {
      goal: "에너지절감 기술과 결합된 에너지절감 교육 프로세스 개발",
      contents: [
        "에너지절감 및 서비스 성능 향상개발",
        "상용화 AI 플랫폼 개발",
      ],
      budget: "5억원 (총 6.25억원)",
      department: "중소벤처기업부",
      category: "창업성장기술개발(일반,R&D)",
    },
  },
  {
    agency: "정보통신산업진흥원",
    research: "AI기반의 사전예방 및 빠른 복구가 가능한 에너지 재난대응 플랫폼 개발",
    lead: "나인와트(공동)",
    period: "21.04~23.12",
    status: "완료",
    detail: {
      goal: "에너지 재난 사전 예방 및 빠른 복구를 위한 분산에너지시스템 적용 모니터링, 데이터관리, 분석, 지능형 복구 등의 기술이 포함되는 인공지능 기반의 에너지 재난 대응 기술 개발",
      contents: [
        "에너지 시스템 모니터링 및 상태 측정 지원 데이터 처리 시스템 기술",
        "사고 예방을 위한 에너지 상태분석 및 예측 시스템 개발",
        "지능형 에너지 시스템 복구 기술 개발",
      ],
      budget: "31.29억원 (총 37.7억원)",
      department: "과학기술정보통신부",
      category: "인공지능중심산업융합집적단지조성(R&D)",
    },
  },
  {
    agency: "경북테크노파크",
    research: "풍력단지 O&M 기술개발 인재양성 산학협력",
    lead: "나인와트(공동)",
    period: "20.07~21.03",
    status: "완료",
    detail: {
      goal: "국내외 풍력관련 최신정보 조사분석을 통한 관련기관에 제공 — 에너지산업융복합단지 조성사업의 세부과제와의 연계협력",
      contents: [],
      budget: "19.23억원 (총 39.24억원)",
      department: "산업통상자원부",
      category: "에너지인력양성사업",
    },
  },
  {
    agency: "한국에너지기술연구원",
    research: "에너지바우처 연계 관리서비스용 무선통신 열계량 시스템 개발",
    lead: "나인와트",
    period: "20.01~20.12",
    status: "완료",
    detail: {
      goal: "블루투스 5.0 기반 지역난방 세대용 열량계 무선 원격검침 시스템 개발",
      contents: [
        "블루투스 5.0 MESH 기반 지역난방용 열계량 시스템을 통한 데이터 수집/서비스 개발",
        "에너지바우처의 효율적 사용을 위한 이해관계자 편의향상 서비스 개발",
        "각 주민센터에서 보유한 지자체 지원 생활보호대상자, 각종 지원을 위한 지역 소속 대상자의 정보와 연계하는 서비스 개발",
      ],
      budget: "3,000만원 (총 3,750만원)",
      department: "중소벤처기업부",
      category: "중소기업R&D역량제고(R&D)",
    },
  },
  {
    agency: "정보통신산업진흥원",
    research: "클라우드 기반 에너지진단 솔루션 개발",
    lead: "나인와트",
    period: "21.04~21.12",
    status: "완료",
  },
  {
    agency: "중소벤처기업부",
    research: "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스",
    lead: "나인와트",
    period: "22.04~25.12",
    status: "완료",
    detail: {
      goal: "탄소배출권 활용을 통한 그린리모델링 시장 활성화: 그린리모델링을 통한 탄소배출권 확보 방법론 및 고객 모집, 탄소배출권 활용 그린리모델링 플랫폼 유럽 진출, 부동산 연계 소비자 마케팅",
      contents: [
        "탄소배출권 확보 프로세스 효율화, 탄소금융펀드 조성",
        "ESG 펀드 등 자금확보 다각화",
        "탄소배출권 기반 그린리모델링 유럽 사업",
        "플랫폼 운영 및 추가 실증",
      ],
      budget: "5억원 (총 6.25억원)",
      department: "중소벤처기업부",
      category: "그린뉴딜유망기업100",
    },
  },
  {
    agency: "중소벤처기업부",
    research: "그린리모델링 대상 건물 선별 및 성능개선을 위한 도시단위 광역진단 기술",
    lead: "나인와트",
    period: "22.04~24.12",
    status: "완료",
    detail: {
      goal: "탄소중립 실현을 위한 그린리모델링 도시단위 광역진단 플랫폼 구현",
      contents: [
        "도시 데이터 수집 저장 유지관리 체계 구축",
        "데이터 기반의 도시단위 광역 진단 모델 개발",
        "그린리모델링 생태계 조성을 위한 정책 마련",
      ],
      budget: "5억원 (총 6.25억원)",
      department: "중소벤처기업부",
      category: "그린뉴딜유망기업100",
    },
  },
  {
    agency: "국토교통과학기술진흥원",
    research: "그린리모델링 효율향상을 위한 디지털 진단 모듈화 기술",
    lead: "나인와트",
    period: "22.04~24.12",
    status: "완료",
    detail: {
      goal: "동일 비용투자 시 탄소감축 효과가 높은 그린리모델링 대상건물 선정 기술 개발(진단)",
      contents: [
        "AI기반 건물에너지 디지털진단 및 도시 에너지 소비량 예측-에너지 효율화",
        "공간정보 기반 지도 구축 및 정보플랫폼 개발",
        "사업화 타당성 및 실현가능성 분석",
      ],
      budget: "3.5억원 (총 4.63억원)",
      department: "국토교통부",
      category: "국토교통기술사업화를위한이어달리기사업",
    },
  },
  {
    agency: "중소기업기술정보진흥원",
    research: "에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발",
    lead: "나인와트",
    period: "23.12~26.12",
    status: "수행중",
    detail: {
      goal: "도시 단위 3차원으로 시각화된 에너지 맵을 구축하고, 에너지 맵에 기반하여 버티포트를 설치 가능한 최적의 위치를 제공하는 솔루션 개발",
      contents: [
        "도시 에너지/탄소 계획",
        "UAM 버티포트 최적 설치/운영",
        "에너지 수요반응 설계",
      ],
      budget: "11.4억원 (총 14.25억원)",
      department: "중소벤처기업부",
      category: "중소기업기술혁신개발(스케일업 TIPS)",
    },
  },
  {
    agency: "한국환경산업기술원",
    research: "수열원 시스템 동절기 효율향상 및 AI 기반 최적 운영 제어 기술 개발",
    lead: "장한기술(주) / 나인와트",
    period: "25.04~29.12",
    status: "수행중",
  },
  {
    agency: "한국연구재단",
    research: "리튬배터리 제조사업장의 전주기 화재 안전 관리시스템 기술 개발",
    lead: "티팩토리 / 나인와트",
    period: "25.06~28.12",
    status: "수행중",
  },
  {
    agency: "국토교통과학기술진흥원",
    research: "건물부분 탄소중립 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발",
    lead: "건설기술연구원 / 나인와트",
    period: "23.04~26.12",
    status: "수행중",
    detail: {
      goal: "건물부문 2050 탄소중립 기반 구축 및 이행 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발",
      contents: [
        "유관 데이터 연계, 소비성능 평가지표 및 평가모델 설계, 데이터통합관리시스템 설계",
        "유관 데이터 통합 및 검증, 소비성능 평가 방법론 정립, 데이터통합관리시스템 구축",
        "건물에너지 소비데이터 통합관리시스템(I-BED) 구축 및 활용기반 마련",
      ],
      budget: "152억원 (총 171억원)",
      department: "국토교통부",
      category: "건물에너지소비데이터통합관리기반구축",
    },
  },
  {
    agency: "국토교통과학기술진흥원",
    research: "도시 건물 넷 제로 혁신적 전환 위한 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발",
    lead: "건설기술연구원 / 나인와트",
    period: "24.07~27.03",
    status: "수행중",
    detail: {
      goal: "공간정보를 통합한 도시 건물 에너지의 데이터 기반 분석 기술 구현과 3D realistic 가시화 및 AI 어시스턴트 기능 기반 실용적인 인터페이스를 제공하는 도시 건물 에너지 정보제공 플랫폼 개발",
      contents: [
        "건축물 고유키 기반 데이터 맵핑 및 집계 기술 개발 / 건물 에너지 성능 특성정보 DB화",
        "월별 에너지 소비 데이터 기반 도시 건물 에너지 평가기술 개발 (개별 건물 + 도시 건물 집단 분석)",
        "도시 건물 에너지 분석 시스템 개발 (UBEM 플랫폼, AI어시스턴트 기술)",
      ],
      budget: "13.125억원 (총 14.56억원)",
      department: "국토교통부",
      category: "협력거점형 국토교통 국제협력 연구개발사업",
    },
  },
];

const inProgress = rndProjects.filter((p) => p.status === "수행중");
const completed = rndProjects.filter((p) => p.status === "완료");

function ProjectRow({ project, labels }: { project: RndProject; labels: { goal: string; contents: string; category: string; department: string; budget: string } }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!project.detail;

  return (
    <>
      <tr
        className={`border-b border-border ${hasDetail ? "cursor-pointer hover:bg-secondary/30 transition-colors" : ""}`}
        onClick={() => hasDetail && setOpen(!open)}
      >
        <td className="py-3 pr-4 text-muted">{project.agency}</td>
        <td className="py-3 pr-4">
          <span className="flex items-center gap-2">
            {project.research}
            {hasDetail && (
              <svg
                className={`w-4 h-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </td>
        <td className="py-3 pr-4 text-muted">{project.lead}</td>
        <td className="py-3 whitespace-nowrap text-muted">{project.period}</td>
      </tr>
      {hasDetail && open && (
        <tr className="border-b border-border bg-secondary/20">
          <td colSpan={4} className="px-4 py-5">
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              {/* 연구개발 목표 */}
              <div className="md:col-span-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted mb-1.5">
                  {labels.goal}
                </h4>
                <p className="text-foreground/90 leading-relaxed">
                  {project.detail!.goal}
                </p>
              </div>

              {/* 세부사업내용 */}
              {project.detail!.contents.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted mb-1.5">
                    {labels.contents}
                  </h4>
                  <ul className="space-y-1">
                    {project.detail!.contents.map((c, i) => (
                      <li key={i} className="flex gap-2 text-foreground/90 leading-relaxed">
                        <span className="text-muted shrink-0">{i + 1}.</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 하단 메타정보 */}
              <div className="flex flex-wrap gap-x-8 gap-y-2 md:col-span-2 pt-2 border-t border-border/50">
                <div>
                  <span className="text-xs text-muted">{labels.category}</span>
                  <p className="text-foreground/90">{project.detail!.category}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">{labels.department}</span>
                  <p className="text-foreground/90">{project.detail!.department}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">{labels.budget}</span>
                  <p className="text-foreground/90">{project.detail!.budget}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ProjectTable({ projects, headerLabels, detailLabels }: { projects: RndProject[]; headerLabels: { agency: string; research: string; lead: string; period: string }; detailLabels: { goal: string; contents: string; category: string; department: string; budget: string } }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.agency}</th>
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.research}</th>
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.lead}</th>
            <th className="py-3 font-semibold text-muted">{headerLabels.period}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <ProjectRow key={i} project={p} labels={detailLabels} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RndContent() {
  const t = useTranslations("solutions");
  const headerLabels = t.raw("rnd.tableHeaders") as { agency: string; research: string; lead: string; period: string };
  const detailLabels = t.raw("rnd.detailLabels") as { goal: string; contents: string; category: string; department: string; budget: string };

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("rnd.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("rnd.subtitle")} — {rndProjects.length}{t("rnd.count")} ({t("rnd.inProgress")}{" "}
            {inProgress.length}, {t("rnd.completed")} {completed.length})
          </p>
          <p className="mt-2 text-sm text-muted">
            {t("rnd.clickHint")}
          </p>
        </div>
      </section>

      {/* In Progress */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold">
            {t("rnd.inProgress")} <span className="text-muted">({inProgress.length}{t("rnd.count")})</span>
          </h2>
          <div className="mt-6">
            <ProjectTable projects={inProgress} headerLabels={headerLabels} detailLabels={detailLabels} />
          </div>
        </div>
      </section>

      {/* Completed */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold">
            {t("rnd.completed")} <span className="text-muted">({completed.length}{t("rnd.count")})</span>
          </h2>
          <div className="mt-6">
            <ProjectTable projects={completed} headerLabels={headerLabels} detailLabels={detailLabels} />
          </div>
        </div>
      </section>
    </>
  );
}
