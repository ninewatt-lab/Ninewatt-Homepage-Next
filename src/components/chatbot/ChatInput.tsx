"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { SendIcon } from "./icons";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

const MAX_LEN = 1000;

export default function ChatInput({ onSend, disabled, autoFocus }: Props) {
  const t = useTranslations("chatbot.input");
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed.slice(0, MAX_LEN));
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 rounded-2xl border border-border bg-surface-elevated px-3.5 py-2 transition-colors focus-within:border-foreground/30">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          rows={1}
          disabled={disabled}
          className="block w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-hidden placeholder:text-muted/70 focus:outline-hidden focus-visible:outline-hidden disabled:opacity-50"
          aria-label={t("placeholder")}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        aria-label={t("sendLabel")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-25 dark:bg-background dark:text-foreground"
      >
        <SendIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
