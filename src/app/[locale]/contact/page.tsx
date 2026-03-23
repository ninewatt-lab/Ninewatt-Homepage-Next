import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return {
    title: `${t("title")} - Ninewatt`,
    description: t("subtitle"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const typeOptions = t.raw("typeOptions") as string[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold text-primary">Contact Us</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold">{t("formTitle")}</h2>
            <p className="mt-2 text-sm text-muted">
              {t("formDesc")}
            </p>
            <form className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder={t("namePlaceholder")}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium">
                    {t("companyLabel")}
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder={t("companyPlaceholder")}
                  />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">
                    {t("phoneLabel")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder={t("phonePlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium">
                  {t("typeLabel")}
                </label>
                <select
                  id="type"
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  {typeOptions.map((option: string) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">
                  {t("messageLabel")}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder={t("messagePlaceholder")}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark sm:w-auto"
              >
                {t("submit")}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold">{t("infoTitle")}</h2>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">{t("hqLabel")}</p>
                <p className="mt-2 text-sm text-muted">
                  {t("hqAddress")}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">{t("rndLabel")}</p>
                <p className="mt-2 text-sm text-muted">
                  {t("rndAddress")}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">{t("phoneInfo")}</p>
                <p className="mt-2 text-sm text-muted">{t("phoneNumber")}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <p className="text-sm font-semibold text-primary">{t("emailInfo")}</p>
                <p className="mt-2 text-sm text-muted">{t("emailAddress")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
