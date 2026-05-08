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
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-primary opacity-0 motion-safe:animate-[fab-halo_2.4s_ease-out_3_forwards] motion-reduce:hidden"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-primary opacity-0 motion-safe:animate-[fab-halo_2.4s_ease-out_0.8s_3_forwards] motion-reduce:hidden"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={t("openLabel")}
            aria-expanded={false}
            className="group relative flex items-center gap-2.5 rounded-full bg-primary py-3.5 pl-5 pr-6 text-white shadow-[0_10px_32px_-8px_rgba(56,150,168,0.55),0_4px_12px_-4px_rgba(56,150,168,0.3)] ring-1 ring-inset ring-white/10 transition-all hover:scale-[1.02] hover:shadow-[0_14px_40px_-8px_rgba(56,150,168,0.65),0_4px_12px_-4px_rgba(56,150,168,0.35)] hover:bg-primary-dark active:scale-95"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 motion-safe:animate-[fab-breath_3s_ease-in-out_infinite]"
            />
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              <SparkleIcon className="h-3.5 w-3.5" />
            </span>
            <span className="relative text-[14px] font-semibold tracking-tight">
              {t("label")}
            </span>
          </button>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1.5 -right-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_2px_8px_-2px_rgba(244,63,94,0.6)] ring-2 ring-background"
          >
            {t("newBadge")}
          </span>
        </>
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
        @keyframes fab-halo {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
