"use client";

import { useTranslations } from "next-intl";
import { ChevronDownIcon, SparkleIcon } from "./icons";
import { useChatbot } from "./ChatbotProvider";

export default function ChatbotFAB() {
  const t = useTranslations("chatbot.fab");
  const { open, toggle } = useChatbot();

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={t("closeLabel")}
          aria-expanded={true}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_24px_-8px_rgba(56,150,168,0.5)] transition-all hover:bg-primary-dark active:scale-95"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-label={t("openLabel")}
          aria-expanded={false}
          className="group relative flex items-center gap-2.5 rounded-full bg-primary py-3 pl-4 pr-5 text-white shadow-[0_10px_32px_-8px_rgba(56,150,168,0.55),0_4px_12px_-4px_rgba(56,150,168,0.3)] ring-1 ring-inset ring-white/10 transition-all hover:scale-[1.02] hover:shadow-[0_14px_40px_-8px_rgba(56,150,168,0.65),0_4px_12px_-4px_rgba(56,150,168,0.35)] hover:bg-primary-dark active:scale-95"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 motion-safe:animate-[fab-breath_3s_ease-in-out_infinite]"
          />
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
            <SparkleIcon className="h-3.5 w-3.5" />
          </span>
          <span className="relative text-[13px] font-semibold tracking-tight">
            {t("label")}
          </span>
        </button>
      )}

      <style jsx>{`
        @keyframes fab-breath {
          0%,
          100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}
