export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Ninewatt
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/60 sm:text-xl">
            나인와트에 오신 것을 환영합니다.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="#contact"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
            >
              문의하기
            </a>
            <a
              href="#about"
              className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              더 알아보기
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-foreground/[.02] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            회사소개
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/60">
            나인와트를 소개합니다.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            서비스
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/60">
            나인와트가 제공하는 서비스를 확인해보세요.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-foreground/[.02] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            문의하기
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/60">
            궁금한 사항이 있으시면 연락주세요.
          </p>
        </div>
      </section>
    </>
  );
}
