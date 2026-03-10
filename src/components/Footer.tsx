import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold text-foreground">Ninewatt</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              GX 실현을 이끄는 에너지 기술로,
              <br />
              스마트시티와 탄소중립 사회에 기여합니다.
            </p>
            <div className="mt-4 space-y-1 text-sm text-muted">
              <p>(본사) 인천광역시 연수구 컨벤시아대로 204, 104호</p>
              <p>(기업부설연구소) 서울특별시 강남구 강남대로 162길 22 2,4F</p>
              <p>Tel. 070-8866-7226</p>
              <p>Email. ninewatt@ninewatt.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-semibold text-foreground">바로가기</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <Link href="/product" className="transition-colors hover:text-foreground">Product</Link>
              <Link href="/solutions" className="transition-colors hover:text-foreground">Solutions</Link>
              <Link href="/company" className="transition-colors hover:text-foreground">Company</Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">Contact Us</Link>
            </div>
          </div>

          <div>
            <p className="font-semibold text-foreground">더보기</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <Link href="/company" className="transition-colors hover:text-foreground">특허 & 인증</Link>
              <Link href="/company" className="transition-colors hover:text-foreground">글로벌 사업</Link>
              <Link href="/company" className="transition-colors hover:text-foreground">수상 내역</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Ninewatt Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted">
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
