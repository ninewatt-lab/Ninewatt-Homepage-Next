import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[.08] bg-background/80 backdrop-blur-md dark:border-white/[.08]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Ninewatt
        </Link>
        <nav className="hidden gap-8 md:flex">
          <Link
            href="#about"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            회사소개
          </Link>
          <Link
            href="#services"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            서비스
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            문의하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
