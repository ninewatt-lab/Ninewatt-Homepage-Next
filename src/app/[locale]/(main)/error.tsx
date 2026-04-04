"use client";

import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold text-primary/20">500</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {t("error.serverErrorTitle")}
      </h1>
      <p className="mt-3 max-w-md text-muted">
        {t("error.serverErrorDescription")}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {t("error.tryAgain")}
      </button>
    </section>
  );
}
