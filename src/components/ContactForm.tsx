"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

interface ContactFormProps {
  labels: {
    nameLabel: string;
    namePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    typeLabel: string;
    typeOptions: string[];
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
  };
}

export default function ContactForm({ labels }: ContactFormProps) {
  const t = useTranslations("common");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      type: formData.get("type"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("contact.errorMessage"));
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("contact.errorMessage"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            {labels.nameLabel}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            placeholder={labels.namePlaceholder}
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium">
            {labels.companyLabel}
          </label>
          <input
            type="text"
            id="company"
            name="company"
            className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            placeholder={labels.companyPlaceholder}
          />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            {labels.emailLabel}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            placeholder={labels.emailPlaceholder}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            {labels.phoneLabel}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            placeholder={labels.phonePlaceholder}
          />
        </div>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          {labels.typeLabel}
        </label>
        <select
          id="type"
          name="type"
          className="mt-1 w-full appearance-none rounded-lg border border-border bg-surface-elevated bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-size-[16px] bg-position-[right_12px_center] bg-no-repeat px-4 pr-10 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
        >
          {labels.typeOptions.map((option: string) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          {labels.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
          placeholder={labels.messagePlaceholder}
        />
      </div>

      {status === "success" && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {t("contact.successMessage")}
        </div>
      )}
      {status === "error" && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50 sm:w-auto"
      >
        {status === "sending" ? `${labels.submit}...` : labels.submit}
      </button>
    </form>
  );
}
