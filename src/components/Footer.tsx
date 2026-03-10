import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/[.08] bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold text-primary">Ninewatt</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              GX 실현을 이끄는 에너지 기술로,
              <br />
              스마트시티와 탄소중립 사회에 기여합니다.
            </p>
            <div className="mt-4 space-y-1 text-sm text-foreground/60">
              <p>(본사) 인천광역시 연수구 컨벤시아대로 204, 104호</p>
              <p>(기업부설연구소) 서울특별시 강남구 강남대로 162길 22 2,4F</p>
              <p>Tel. 070-8866-7226</p>
              <p>Email. ninewatt@ninewatt.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-semibold">바로가기</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/60">
              <Link href="/about" className="hover:text-primary">회사소개</Link>
              <Link href="/solutions" className="hover:text-primary">솔루션</Link>
              <Link href="/product/opti" className="hover:text-primary">Opti</Link>
              <Link href="/cases" className="hover:text-primary">수행사례</Link>
            </div>
          </div>

          <div>
            <p className="font-semibold">더보기</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/60">
              <Link href="/research" className="hover:text-primary">R&D</Link>
              <Link href="/patents" className="hover:text-primary">특허</Link>
              <Link href="/global" className="hover:text-primary">글로벌</Link>
              <Link href="/contact" className="hover:text-primary">문의하기</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-black/[.08] pt-8 md:flex-row">
          <p className="text-sm text-foreground/40">
            &copy; {new Date().getFullYear()} Ninewatt Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-foreground/40">
            <a href="#" className="transition-colors hover:text-foreground">
              개인정보처리방침
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
