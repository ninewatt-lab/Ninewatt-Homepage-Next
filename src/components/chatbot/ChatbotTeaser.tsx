"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useChatbot } from "./ChatbotProvider";

const APPEAR_DELAY_MS = 2000;
const AUTO_DISMISS_MS = 30000;
const FADE_MS = 300;

export default function ChatbotTeaser() {
  const t = useTranslations("chatbot.teaser");
  const { open, setOpen } = useChatbot();
  const [render, setRender] = useState(false);
  const [show, setShow] = useState(false);

  const eligible = !open;
  const displayShow = show && eligible;

  useEffect(() => {
    if (!eligible) return;
    const t1 = setTimeout(() => setRender(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t1);
  }, [eligible]);

  useEffect(() => {
    if (!render) return;
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [render]);

  useEffect(() => {
    if (!displayShow) return;
    const t = setTimeout(() => setShow(false), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [displayShow]);

  useEffect(() => {
    if (displayShow || !render) return;
    const t = setTimeout(() => setRender(false), FADE_MS);
    return () => clearTimeout(t);
  }, [displayShow, render]);

  if (!render) return null;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="chatbot-teaser-title"
      className={`fixed bottom-24 right-5 z-50 max-w-70 sm:bottom-28 sm:right-6 sm:max-w-80 transition-all duration-300 motion-reduce:transition-none ${
        displayShow
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      <div className="relative rounded-2xl border border-border bg-background shadow-[0_30px_80px_-20px_rgba(15,23,42,0.18),0_8px_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_8px_24px_-12px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={handleOpen}
          className="block w-full rounded-2xl px-4 py-3.5 pr-9 text-left transition-colors hover:bg-foreground/3"
        >
          <h3
            id="chatbot-teaser-title"
            className="text-[14px] font-semibold leading-snug text-foreground"
          >
            {t("title")}
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/70">
            {t("body")}
          </p>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("dismiss")}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M2 2 L10 10 M10 2 L2 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
