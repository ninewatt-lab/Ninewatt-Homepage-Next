import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "pretendard-jp/dist/web/variable/pretendardvariable-jp-dynamic-subset.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ThemeProvider from "@/components/ThemeProvider";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { SITE_URL } from "@/lib/seo";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  // generateMetadata는 서버에서만 실행되므로 NEXT_PUBLIC_ 접두어를 쓰지 않는다.
  // NEXT_PUBLIC_* 는 빌드 시점에 값이 인라인되는데, Dockerfile이 build-arg를
  // 넘기지 않아 프로덕션 빌드에서 undefined가 박혀버린다.
  // 서버 전용 변수는 런타임에 읽히므로 재빌드 없이 값만 바꿀 수 있다.
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const naver = process.env.NAVER_SITE_VERIFICATION;

  return {
    // 하위 페이지가 상대 경로 canonical·OG URL을 쓸 수 있도록 여기서 한 번만 선언
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("metadata.title"),
      template: "%s | Ninewatt",
    },
    description: t("metadata.description"),
    // alternates는 여기에 두면 안 된다.
    // 하위 전 페이지가 상속받아 canonical이 /{locale}로 고정된다.
    // 페이지별로 buildMetadata()(src/lib/seo.ts)를 호출해 생성할 것.
    verification: {
      ...(google ? { google } : {}),
      ...(naver ? { other: { "naver-site-verification": naver } } : {}),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="light" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider>
            {children}
            <ChatbotWidget />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
