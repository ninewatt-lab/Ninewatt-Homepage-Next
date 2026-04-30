"use client";

import { useTranslations } from "next-intl";
import type { QuickReply } from "./types";

interface Props {
  onSelect: (reply: QuickReply) => void;
  disabled?: boolean;
}

export default function QuickReplies({ onSelect, disabled }: Props) {
  const t = useTranslations("chatbot");
  const replies: QuickReply[] = [
    { id: "products", label: t("quickReplies.products"), prompt: t("quickReplies.products") },
    { id: "solutions", label: t("quickReplies.solutions"), prompt: t("quickReplies.solutions") },
    { id: "consult", label: t("quickReplies.consult"), prompt: t("quickReplies.consult") },
    { id: "company", label: t("quickReplies.company"), prompt: t("quickReplies.company") },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted/80">
        {t("quickRepliesTitle")}
      </p>
      <div className="flex flex-col">
        {replies.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r)}
            disabled={disabled}
            className="group flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-left text-[13px] text-foreground transition-colors last:border-b-0 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="flex-1 leading-snug">{r.label}</span>
            <span
              aria-hidden="true"
              className="text-muted/70 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
            >
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
