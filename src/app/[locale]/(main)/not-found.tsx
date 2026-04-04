import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold text-primary/20">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {t("error.notFoundTitle")}
      </h1>
      <p className="mt-3 max-w-md text-muted">
        {t("error.notFoundDescription")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {t("error.backToHome")}
      </Link>
    </section>
  );
}
