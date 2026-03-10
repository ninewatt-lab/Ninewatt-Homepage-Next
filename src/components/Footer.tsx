export default function Footer() {
  return (
    <footer className="border-t border-black/[.08] bg-background dark:border-white/[.08]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-lg font-bold">Ninewatt</p>
            <p className="mt-1 text-sm text-foreground/60">
              &copy; {new Date().getFullYear()} Ninewatt. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-foreground/60">
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
