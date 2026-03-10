import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "R&D 과제 - Ninewatt",
  description: "나인와트 R&D 수행 이력. 정부 R&D 과제 수행을 통한 기술력 확보",
};

const rndProjects = [
  { agency: "중소기업기술정보진흥원", research: "빅데이터분석 기반 에너지절감 AI플랫폼 개발", lead: "나인와트", period: "21.07~21.12", status: "완료" },
  { agency: "정보통신산업진흥원", research: "AI기반의 사전예방 및 빠른 복구가 가능한 에너지 재난대응 플랫폼 개발", lead: "나인와트(공동)", period: "21.04~23.12", status: "완료" },
  { agency: "경북테크노파크", research: "풍력단지 O&M 기술개발 인재양성 산학협력", lead: "나인와트(공동)", period: "20.07~21.03", status: "완료" },
  { agency: "정보통신산업진흥원", research: "클라우드 기반 에너지진단 솔루션 개발", lead: "나인와트", period: "21.04~21.12", status: "완료" },
  { agency: "중소벤처기업부", research: "그린리모델링 대상 건물 선별 및 성능개선을 위한 도시단위 광역진단 기술", lead: "나인와트", period: "22.04~24.12", status: "완료" },
  { agency: "국토교통과학기술진흥원", research: "그린리모델링 효율향상을 위한 디지털 진단 모듈화 기술", lead: "나인와트", period: "22.04~24.12", status: "완료" },
  { agency: "중소기업기술정보진흥원", research: "에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발", lead: "나인와트", period: "23.12~26.12", status: "수행중" },
  { agency: "한국환경산업기술원", research: "수열원 시스템 동절기 효율향상 및 AI 기반 최적 운영 제어 기술 개발", lead: "장한기술(주) / 나인와트", period: "25.04~29.12", status: "수행중" },
  { agency: "한국연구재단", research: "리튬배터리 제조사업장의 전주기 화재 안전 관리시스템 기술 개발", lead: "티팩토리 / 나인와트", period: "25.06~28.12", status: "수행중" },
  { agency: "국토교통과학기술진흥원", research: "건물부분 탄소중립 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발", lead: "건설기술연구원 / 나인와트", period: "23.04~26.12", status: "수행중" },
  { agency: "국토교통과학기술진흥원", research: "도시 건물 넷 제로 혁신적 전환 위한 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발", lead: "건설기술연구원 / 나인와트", period: "24.07~27.03", status: "수행중" },
];

const inProgress = rndProjects.filter((p) => p.status === "수행중");
const completed = rndProjects.filter((p) => p.status === "완료");

function ProjectTable({ projects }: { projects: typeof rndProjects }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-3 pr-4 font-semibold text-muted">중앙행정기관</th>
            <th className="py-3 pr-4 font-semibold text-muted">연구개발과제명</th>
            <th className="py-3 pr-4 font-semibold text-muted">주관기관</th>
            <th className="py-3 font-semibold text-muted">기간</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-3 pr-4 text-muted">{p.agency}</td>
              <td className="py-3 pr-4">{p.research}</td>
              <td className="py-3 pr-4 text-muted">{p.lead}</td>
              <td className="py-3 whitespace-nowrap text-muted">{p.period}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RndPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">R&D 수행 이력</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            정부 R&D 과제 수행을 통한 기술력 확보 — 총 {rndProjects.length}건 (수행중 {inProgress.length}, 완료 {completed.length})
          </p>
        </div>
      </section>

      {/* In Progress */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold">
            수행중 <span className="text-muted">({inProgress.length}건)</span>
          </h2>
          <div className="mt-6">
            <ProjectTable projects={inProgress} />
          </div>
        </div>
      </section>

      {/* Completed */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold">
            완료 <span className="text-muted">({completed.length}건)</span>
          </h2>
          <div className="mt-6">
            <ProjectTable projects={completed} />
          </div>
        </div>
      </section>
    </>
  );
}
