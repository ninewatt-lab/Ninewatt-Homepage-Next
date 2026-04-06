import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function PPAPage() {
  return (
    <>
      {/* Hero — full-bleed image background */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden -mt-16">
        <div className="absolute inset-0">
          <Image
            src="/images/solar/sites/site-drone-01.jpg"
            alt="나인와트 태양광 발전소"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-zinc-950/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-5">
            재생에너지 전기공급사업자
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.15] whitespace-pre-line max-w-2xl">
            {"RE100, 직접PPA로\n시작하세요"}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-lg whitespace-pre-line">
            {"나인와트는 등록된 재생에너지 전기공급사업자로서,\n재생에너지 발전사업자와 전기사용자를 연결합니다."}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/energy/contact"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              발전사업자 참여 문의
            </Link>
            <Link
              href="/energy/contact"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-zinc-300 border border-zinc-600 hover:border-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              RE100 전력 구매 문의
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — 나인와트 실적 */}
      <section className="border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
            {[
              { value: "3.84", unit: "MW", label: "자체 발전소 운영" },
              { value: "6", unit: "개소", label: "운영 중 발전소" },
              { value: "94", unit: "%", label: "AI 이상 탐지 정확도" },
              { value: "24/7", unit: "", label: "실시간 모니터링" },
            ].map((stat) => (
              <div key={stat.label} className="py-10 px-6 text-center">
                <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {stat.value}
                  {stat.unit && <span className="text-base font-medium text-zinc-400 ml-0.5">{stat.unit}</span>}
                </p>
                <p className="mt-1.5 text-xs text-zinc-500 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 직접PPA란? */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Direct PPA</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
            직접PPA란?
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            재생에너지를 이용하여 생산한 전기를 전력시장을 통하지 않고 전기사용자에게 직접 공급하는 제도입니다.
            전기사업법 제2조 제12의8에 근거하여 2022년 12월 전면 시행되었습니다.
          </p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 기존 구조 */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
              <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mb-4">기존 전력시장 거래</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">발전사업자</span>
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">전력시장 (KPX)</span>
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">판매사업자 (한전)</span>
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">전기소비자</span>
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                발전사업자가 전력을 생산하여 전력시장을 거쳐 판매사업자(한전)에게 판매하고,
                한전이 전기소비자에게 공급하는 구조
              </p>
            </div>

            {/* 직접PPA 구조 */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-primary/30 p-8">
              <p className="text-xs text-primary font-medium tracking-wider uppercase mb-4">직접PPA 거래</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">재생E 발전사업자</span>
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-sm font-bold text-primary">나인와트 (공급사업자)</span>
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">재생E 전기소비자</span>
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                재생에너지 발전사업자가 전력시장을 거치지 않고 재생E공급사업자(나인와트)를 통해
                전기소비자에게 직접 공급. 초과/부족 전력은 전력시장에서 자동 정산
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 나인와트의 역할 */}
      <section className="py-28 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Our Role</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
            나인와트는 재생에너지 전기공급사업자입니다
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            자체 태양광 발전소 운영 경험과 AI 기술을 바탕으로,
            발전사업자와 전기사용자 사이에서 안정적인 재생에너지 전력 공급을 책임집니다.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "발전소 확보 & 연결",
                desc: "1MW 이상 재생에너지 발전사업자 네트워크를 구축하고, 전기사용자의 수요에 맞는 최적의 발전원을 매칭합니다.",
              },
              {
                num: "02",
                title: "전력 공급 & 정산",
                desc: "시간대별 발전량 기반으로 전력을 공급하고, 초과/부족 전력은 전력시장을 통해 자동으로 정산합니다.",
              },
              {
                num: "03",
                title: "AI 모니터링 & 최적화",
                desc: "PV Intelligence로 발전량을 예측하고, ESS 연계 최적화로 안정적인 전력 공급과 비용 절감을 동시에 달성합니다.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 hover:border-primary/50 transition-colors"
              >
                <span className="text-xs text-zinc-400 font-mono">{item.num}</span>
                <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 계약 유형 */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Contract Types</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
            계약 유형
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-lg">
            사업 규모와 목적에 따라 다양한 계약 형태를 지원합니다
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: "1:1",
                title: "발전설비(1) : 사용자(1)",
                desc: "재생E공급사업자(1기 발전설비 보유)가 전기사용자 1인에게 전기를 공급합니다. 가장 단순한 구조로 소규모 사업에 적합합니다.",
              },
              {
                type: "1:N",
                title: "발전설비(1) : 사용자(N)",
                desc: "하나의 발전설비에서 생산된 전력을 시간대별 구매량 비율(%)로 나누어 다수의 전기사용자에게 공급합니다.",
              },
              {
                type: "N:1",
                title: "발전설비(N) : 사용자(1)",
                desc: "다수 발전설비를 모집한 Aggregator(나인와트)가 전기사용자 1인에게 전기를 공급합니다. 대규모 RE100 이행에 적합합니다.",
              },
            ].map((item) => (
              <div
                key={item.type}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8"
              >
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-lg font-bold rounded-lg">
                  {item.type}
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Off-Site vs On-Site */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Off-Site PPA</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                재생E 발전설비에서 생산된 전기가 한전의 송배전망을 통해 전기사용자에게 공급됩니다.
                전력손실률이 적용되며, 망이용 요금이 발생합니다.
              </p>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">On-Site PPA</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                재생E 발전설비가 전기사용자 부지에 직접 설치되어 전력을 공급합니다.
                전력손실률 0%, 망이용 요금 및 부가정산금이 면제되어 비용이 절감됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 참여 자격 */}
      <section className="py-28 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Eligibility</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
            참여 자격
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">재생에너지 발전사업자</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
                  설비용량 1MW를 초과(합산 또는 단독)하는 재생에너지 발전설비
                </li>
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
                  참여 가능 발전원: 태양에너지, 풍력, 수력, 바이오, 지열, 해양에너지
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">전기사용자</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
                  직접구매자: 수전설비 300kVA 이상 설치자
                </li>
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
                  한전고객: 계약전력 300kW 이상 일반용·산업용(을) 고객
                </li>
              </ul>
            </div>
          </div>

          {/* 참여 절차 */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">참여 절차</h3>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-0">
              {[
                { step: "01", title: "사업자 등록", desc: "한국스마트그리드협회에 전기신사업자로 등록" },
                { step: "02", title: "PPA 계약 체결", desc: "전력공급계약 및 직접전력거래계약 체결" },
                { step: "03", title: "망이용 계약", desc: "한국전력공사와 송배전망 이용 계약 체결" },
                { step: "04", title: "시스템 등록", desc: "전력거래소 이파워마켓 및 직접PPA 시스템 등록" },
              ].map((item, i) => (
                <div key={item.step} className="relative md:pr-8">
                  {i < 3 && (
                    <div className="hidden md:block absolute top-3 right-0 w-full h-px bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  <div className="relative">
                    <span className="text-5xl font-bold text-zinc-200 dark:text-zinc-700">{item.step}</span>
                    <h4 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 기대 효과 */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Benefits</p>
          <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
            직접PPA 기대 효과
          </h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {[
              { title: "RE100 이행", desc: "글로벌 RE100 인증 요건을 충족하는 가장 직접적인 이행 수단을 확보합니다." },
              { title: "가격 안정성", desc: "장기 계약을 통해 재생에너지 전력 가격을 안정적으로 확보하고 요금 변동 리스크를 줄입니다." },
              { title: "ESG 경영", desc: "재생에너지 직접 조달로 탄소중립에 기여하고, ESG 경영 성과를 높입니다." },
              { title: "비용 절감", desc: "On-Site PPA의 경우 망이용 요금 면제, 전력손실 0%로 추가 비용을 절감합니다." },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-xs text-zinc-400 font-mono">0{i + 1}</span>
                <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                직접PPA, 나인와트와 함께하세요
              </h2>
              <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-md whitespace-pre-line">
                {"RE100 이행부터 비용 절감까지,\n나인와트가 최적의 직접PPA 솔루션을 제안합니다."}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/energy/contact"
                className="inline-flex items-center px-7 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              >
                PPA 상담 신청
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <a
                href="tel:070-8866-7226"
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                070-8866-7226
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
