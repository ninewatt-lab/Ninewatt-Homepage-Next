import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RE:park - 스마트 시설물 관리 시스템 - Ninewatt",
  description:
    "시민·관리자·보수업체를 위한 QR 기반 시설물 관리시스템. 공원시설물에서 공공시설물 관리 시스템으로.",
};

export default function REparkPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-amber-600">
            Smart Facility Management
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            RE:park
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            QR 기반 시설물 관리 시스템
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            시민은 QR 코드로 고장을 신고하고, 관리자는 접수·배정을 처리하고,
            보수업체는 작업을 완료 보고합니다. 세 주체를 하나로 잇는 시설물 관리 시스템입니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              서비스 문의하기
            </Link>
            <a
              href="/files/NINEWATT_RE-PARK.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* Service features — inline tags */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-3 text-sm">
          {[
            "QR TAG 스마트 고장신고",
            "데이터 구축·전용 표찰 제작",
            "SaaS형 클라우드 서비스",
            "관리자 업무 디지털 전환",
            "비대면 민원접수 간소화",
          ].map((item) => (
            <span key={item} className="rounded-full border border-border px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Service flow — horizontal, not card grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">서비스 흐름</h2>
          <p className="mt-3 text-muted">시민, 관리자, 보수업체 3자의 워크플로우</p>
          <div className="mt-10 space-y-10">
            {[
              {
                role: "시민",
                flow: "문제 시설물 발견 → QR코드 스캔 → 비대면 고장 신고",
              },
              {
                role: "관리자",
                flow: "신고 내역 접수 → 보수업체에 작업 의뢰 → 처리 상태 관리",
              },
              {
                role: "보수업체",
                flow: "작업의뢰 수락 → 작업 완료 보고 → 이력 관리",
              },
            ].map((item) => (
              <div key={item.role} className="md:flex md:items-baseline md:gap-8">
                <h3 className="md:w-32 shrink-0 text-lg font-bold text-amber-600">
                  {item.role}
                </h3>
                <p className="mt-1 md:mt-0 text-sm text-muted">{item.flow}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expansion */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">사업 확장</h2>
          <p className="mt-3 text-muted">
            공원시설물에서 공공시설물 전체로. 관리번호가 없는 벤치, 맨홀, 버스정류장 등도 통합 관리합니다.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "고장난 시설물 비대면 신고 및 처리알림전송",
              "고장신고 관련 행정인력 비용 절감",
              "불필요한 업무 프로세스 생략",
              "통합 관리 데이터베이스 구축으로 업무 전산화",
            ].map((item) => (
              <li key={item} className="border-l-2 border-amber-500 pl-4 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case Study */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">구축 사례</h2>
          <div className="mt-8 rounded-xl border border-border p-6 md:p-8">
            <h3 className="text-xl font-bold">인천 센트럴파크, 해돋이공원</h3>
            <p className="mt-2 text-sm text-muted">
              인천스타트업파크 × 인천시설공단 송도공원사업단 × 나인와트
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted">1차 실증 (~23.11.30)</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">조명시설 1,300개</p>
              </div>
              <div>
                <p className="text-sm text-muted">2차 실증 (24.01.01~)</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">조경·운동시설 2,000개</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="md:flex md:gap-4">
                <span className="text-sm font-medium md:w-20 shrink-0">2023</span>
                <p className="text-sm text-muted">인천스타트업파크 실증 상용화 프로그램 — 센트럴파크, 해돋이공원 내 조명시설 대상 진행 완료</p>
              </div>
              <div className="md:flex md:gap-4">
                <span className="text-sm font-medium md:w-20 shrink-0">2024~</span>
                <p className="text-sm text-muted">2차 기술개발제품 공공기관 실증지원사업 — 인천시설공단 실증 선정, 조경 및 운동시설 대상</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">RE:park 도입 문의</h2>
            <p className="mt-2 text-muted">
              시설물 관리의 디지털 전환을 함께 시작하세요.
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              문의하기
            </Link>
            <a
              href="/files/NINEWATT_RE-PARK.pdf"
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
