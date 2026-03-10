import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "R&D - Ninewatt",
  description: "나인와트의 R&D 수행 이력 및 용역과제 실적",
};

const rndProjects = [
  { agency: "중소기업기술정보진흥원", program: "민간투자주도형 기술창업지원", research: "빅데이터분석 기반 에너지절감 AI플랫폼 개발", lead: "나인와트", period: "21.07~21.12", status: "완료" },
  { agency: "정보통신산업진흥원", program: "인공지능 산업융합 집적단지 조성 연구개발사업", research: "AI기반의 사전예방 및 빠른 복구가 가능한 에너지 재난대응 플랫폼 개발", lead: "나인와트(공동)", period: "21.04~23.12", status: "완료" },
  { agency: "경북테크노파크", program: "경북지역 풍력에너지 조성 양성사업", research: "풍력단지 O&M 기술개발 인재양성 산학협력", lead: "나인와트(공동)", period: "20.07~21.03", status: "완료" },
  { agency: "정보통신산업진흥원", program: "국가 핵심산업 클라우드 플래그십", research: "클라우드 기반 에너지진단 솔루션 개발", lead: "나인와트", period: "21.04~21.12", status: "완료" },
  { agency: "중소벤처기업부", program: "그린벤처 프로그램 R&D", research: "그린리모델링 대상 건물 선별 및 성능개선을 위한 도시단위 광역진단 기술", lead: "나인와트", period: "22.04~24.12", status: "완료" },
  { agency: "국토교통과학기술진흥원", program: "국토교통 이어달리기", research: "그린리모델링 효율향상을 위한 디지털 진단 모듈화 기술", lead: "나인와트", period: "22.04~24.12", status: "완료" },
  { agency: "중소기업기술정보진흥원", program: "중소기업기술혁신개발사업(시장확대형)", research: "에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발", lead: "나인와트", period: "23.12~26.12", status: "수행중" },
  { agency: "한국환경산업기술원", program: "중앙집중형 실증플랜트 기술개발", research: "수열원 시스템 동절기 효율향상 및 AI 기반 최적 운영 제어 기술 개발", lead: "장한기술(주) / 나인와트", period: "25.04~29.12", status: "수행중" },
  { agency: "한국연구재단", program: "리튬기반 배터리 제조소 및 저장·취급 시설 안전을 위한 기술개발(R&D)", research: "리튬배터리 제조사업장의 전주기 화재 안전 관리시스템 기술 개발", lead: "티팩토리 / 나인와트", period: "25.06~28.12", status: "수행중" },
  { agency: "국토교통과학기술진흥원", program: "건물부문 탄소중립 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발", research: "건물부분 탄소중립 가속화를 위한 건문에너지 소비 데이터 통합관리 기반기술 개발", lead: "건설기술연구원 / 나인와트", period: "23.04~26.12", status: "수행중" },
  { agency: "국토교통과학기술진흥원", program: "협력 거점형 국토교통 국제협력 연구개발 사업(R&D)", research: "도시 건물 넷 제로 혁신적 전환 위한 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발", lead: "건설기술연구원 / 나인와트", period: "24.07~27.03", status: "수행중" },
];

const serviceProjects = [
  { client: "한국에너지기술연구원", period: "2025.07.04~2025.11.04", title: "산업단지 재생에너지 플랫폼 구축사업" },
  { client: "한국건설기술연구원", period: "2025.06.30~2025.10.31", title: "지역 단위(건물-도로) 탄소배출량 및 도로교통 탄소배출량 가시화 시스템 고도화" },
  { client: "주식회사 네오스텍", period: "2025.06.01~2025.11.30", title: "스마트 조명 운영 데이터 최적화 서비스 (2025년 데이터바우처 공급기업)" },
  { client: "국토교통과학기술진흥원", period: "2025.05.29~2025.12.29", title: "스마트시티 혁신기술 발굴사업 경기도 스마트 ESS 통합자원관리시스템 고도화" },
  { client: "국토안전관리원", period: "2025.05.27~2025.12.20", title: "그린리모델링 최신기술 활용 기획 및 시범사업(GRAI)" },
  { client: "엘에스일렉트릭(주)", period: "2024.11.12~2024.12.30", title: "AI를 활용한 분석 보고서 생성" },
  { client: "경기연구원", period: "2024.09.12~2025.08.30", title: "경기도 광역 도시생태현황지도 및 RE100 플랫폼 서비스 구축산업" },
  { client: "엘에스일렉트릭(주)", period: "2024.07.01~2024.07.30", title: "피크저감형 ESS 최적제어 알고리즘 개발" },
  { client: "한국건설기술연구원", period: "2024.06.25~2024.11.30", title: "지역 단위(건물-도로) 탄소배출량 및 도로교통 탄소배출량 가시화 시스템 개발" },
  { client: "엘에스일렉트릭(주)", period: "2024.01.02~2024.12.31", title: "고도화된 에너지 분석 레포팅 Service(ver2.0)" },
  { client: "현대엔지비주식회사", period: "2023.12.12~2024.06.30", title: "미래 모빌리티 허브의 에너지 효율화 관리를 위한 알고리즘 및 시뮬레이션 개발 및 시각화 PoC" },
  { client: "엘에스일렉트릭(주)", period: "2023.04.18~2023.08.30", title: "스마트진단 MVP3.0 내 Energy Reporting Service 고도화" },
];

export default function ResearchPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold text-white/70">Research & Development</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">R&D</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            정부 R&D 과제 및 용역과제 수행을 통한 기술력 확보
          </p>
        </div>
      </section>

      {/* R&D Projects */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">R&D Projects</p>
          <h2 className="mt-2 text-3xl font-bold">R&D 수행 이력 (최근 5년)</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 pr-4 font-semibold text-foreground/70">중앙행정기관</th>
                  <th className="py-3 pr-4 font-semibold text-foreground/70">연구개발과제명</th>
                  <th className="py-3 pr-4 font-semibold text-foreground/70">주관기관</th>
                  <th className="py-3 pr-4 font-semibold text-foreground/70">기간</th>
                  <th className="py-3 font-semibold text-foreground/70">비고</th>
                </tr>
              </thead>
              <tbody>
                {rndProjects.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4 text-foreground/60">{p.agency}</td>
                    <td className="py-3 pr-4">{p.research}</td>
                    <td className="py-3 pr-4 text-foreground/60">{p.lead}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-foreground/60">{p.period}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "완료" ? "bg-gray-100 text-gray-600" : "bg-primary/10 text-primary"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Service Projects */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Service Projects</p>
          <h2 className="mt-2 text-3xl font-bold">용역과제 수행 이력 (최근 5년)</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 pr-4 font-semibold text-foreground/70">기업(기관명)</th>
                  <th className="py-3 pr-4 font-semibold text-foreground/70">기간</th>
                  <th className="py-3 font-semibold text-foreground/70">수행내용(계약명)</th>
                </tr>
              </thead>
              <tbody>
                {serviceProjects.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4 whitespace-nowrap text-foreground/60">{p.client}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-foreground/60">{p.period}</td>
                    <td className="py-3">{p.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
