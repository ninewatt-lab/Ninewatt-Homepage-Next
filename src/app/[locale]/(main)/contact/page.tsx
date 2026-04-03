import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/ContactForm";

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
            <ContactForm
              labels={{
                nameLabel: t("nameLabel"),
                namePlaceholder: t("namePlaceholder"),
                companyLabel: t("companyLabel"),
                companyPlaceholder: t("companyPlaceholder"),
                emailLabel: t("emailLabel"),
                emailPlaceholder: t("emailPlaceholder"),
                phoneLabel: t("phoneLabel"),
                phonePlaceholder: t("phonePlaceholder"),
                typeLabel: t("typeLabel"),
                typeOptions,
                messageLabel: t("messageLabel"),
                messagePlaceholder: t("messagePlaceholder"),
                submit: t("submit"),
              }}
            />
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
