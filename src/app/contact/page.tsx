import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기 - Ninewatt",
  description: "나인와트에 문의하기. 에너지 솔루션 상담 및 파트너십 문의",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">Contact Us</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">문의하기</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            에너지 솔루션 상담, 파트너십, 기타 문의사항을 남겨주세요.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold">문의 양식</h2>
            <p className="mt-2 text-sm text-muted">
              아래 양식을 작성해 주시면 담당자가 빠르게 연락드리겠습니다.
            </p>
            <form className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    이름 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium">
                    회사명
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="회사명"
                  />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">
                    연락처
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium">
                  문의 유형
                </label>
                <select
                  id="type"
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  <option>솔루션 상담</option>
                  <option>데모 요청</option>
                  <option>파트너십 문의</option>
                  <option>채용 문의</option>
                  <option>기타</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">
                  문의 내용 *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="문의 내용을 입력해주세요."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark sm:w-auto"
              >
                문의 보내기
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold">연락처 정보</h2>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">본사</p>
                <p className="mt-2 text-sm text-muted">
                  인천광역시 연수구 컨벤시아대로 204, 104호 인스타2
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">기업부설연구소 (서울지사)</p>
                <p className="mt-2 text-sm text-muted">
                  서울특별시 강남구 강남대로 162길 22 2,4F
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">전화</p>
                <p className="mt-2 text-sm text-muted">070-8866-7226</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">이메일</p>
                <p className="mt-2 text-sm text-muted">ninewatt@ninewatt.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
