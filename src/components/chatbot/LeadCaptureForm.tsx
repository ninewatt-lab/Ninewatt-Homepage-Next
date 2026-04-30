"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { HandshakeIcon } from "./icons";
import type { ChatMessage } from "./types";

interface Props {
  conversation: ChatMessage[];
  locale: string;
  currentPath: string;
  onSubmitted: () => void;
}

type Status = "idle" | "sending" | "success" | "error";

export default function LeadCaptureForm({
  conversation,
  locale,
  currentPath,
  onSubmitted,
}: Props) {
  const t = useTranslations("chatbot.leadForm");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const formData = new FormData(e.currentTarget);

    const body = {
      name: String(formData.get("name") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim() || undefined,
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      message: String(formData.get("message") ?? "").trim() || undefined,
      locale,
      currentPath,
      conversation: conversation
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content })),
    };

    try {
      const res = await fetch("/api/chatbot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      onSubmitted();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <HandshakeIcon className="h-4 w-4" />
        </span>
        <div className="text-sm">
          <p className="font-semibold text-primary">{t("successTitle")}</p>
          <p className="mt-0.5 text-foreground/80">{t("successBody")}</p>
        </div>
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-border bg-surface-elevated p-4"
    >
      <div className="border-b border-border pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t("title")}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-muted" htmlFor="lead-name">
            {t("name")}
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            required
            maxLength={80}
            placeholder={t("namePlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted" htmlFor="lead-company">
            {t("company")}
          </label>
          <input
            id="lead-company"
            name="company"
            type="text"
            maxLength={120}
            placeholder={t("companyPlaceholder")}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-muted" htmlFor="lead-email">
            {t("email")}
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            required
            maxLength={120}
            placeholder={t("emailPlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted" htmlFor="lead-phone">
            {t("phone")}
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            maxLength={40}
            placeholder={t("phonePlaceholder")}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-muted" htmlFor="lead-message">
          {t("message")}
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={2}
          maxLength={500}
          placeholder={t("messagePlaceholder")}
          className={inputCls}
        />
      </div>

      {status === "error" && (
        <p className="text-[11px] text-red-600 dark:text-red-400">
          {t("errorBody")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow disabled:opacity-50"
      >
        {status === "sending" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
