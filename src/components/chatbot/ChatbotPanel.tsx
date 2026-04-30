"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useChatbot, genId } from "./ChatbotProvider";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickReplies from "./QuickReplies";
import LeadCaptureForm from "./LeadCaptureForm";
import { ChevronDownIcon, RefreshIcon, SparkleIcon } from "./icons";
import type { ChatMessage as ChatMessageType, QuickReply } from "./types";

const STATIC_REPLY_KEYS = ["products", "solutions", "company"] as const;

export default function ChatbotPanel() {
  const t = useTranslations("chatbot");
  const locale = useLocale();
  const pathname = usePathname();
  const {
    open,
    setOpen,
    messages,
    pushMessage,
    updateMessage,
    isLoading,
    setIsLoading,
    hasGreeted,
    markGreeted,
    resetConversation,
  } = useChatbot();

  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !hasGreeted && messages.length === 0) {
      pushMessage({
        id: genId(),
        role: "assistant",
        content: t("greeting"),
        createdAt: Date.now(),
      });
      markGreeted();
    }
  }, [open, hasGreeted, messages.length, pushMessage, markGreeted, t]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessageType = {
        id: genId(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      };
      pushMessage(userMsg);

      const staticKey = STATIC_REPLY_KEYS.find(
        (k) => t(`quickReplies.${k}`) === text
      );
      if (staticKey) {
        pushMessage({
          id: genId(),
          role: "assistant",
          content: t(`static.${staticKey}`),
          createdAt: Date.now(),
        });
        return;
      }

      if (text === t("quickReplies.consult")) {
        pushMessage({
          id: genId(),
          role: "assistant",
          content: t("leadForm.description"),
          createdAt: Date.now(),
          leadCapture: { submitted: false },
        });
        return;
      }

      const assistantId = genId();
      pushMessage({
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        streaming: true,
      });
      setIsLoading(true);

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.role === "user" || m.role === "assistant")
          .filter((m) => m.content.trim().length > 0)
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chatbot/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            locale,
            currentPath: pathname,
          }),
        });

        if (res.status === 429) {
          updateMessage(assistantId, {
            content: t("input.limitReached"),
            streaming: false,
            error: true,
          });
          return;
        }
        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        let leadTriggered = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const evt = JSON.parse(trimmed);
              if (evt.type === "text" && typeof evt.delta === "string") {
                acc += evt.delta;
                updateMessage(assistantId, { content: acc });
              } else if (evt.type === "lead_capture") {
                leadTriggered = true;
              } else if (evt.type === "error") {
                throw new Error(evt.message ?? "stream error");
              }
            } catch {
              // ignore partial JSON lines
            }
          }
        }

        updateMessage(assistantId, {
          streaming: false,
          content: acc || t("greeting"),
        });

        if (leadTriggered) {
          pushMessage({
            id: genId(),
            role: "assistant",
            content: t("leadForm.description"),
            createdAt: Date.now(),
            leadCapture: { submitted: false },
          });
        }
      } catch {
        updateMessage(assistantId, {
          content: t("input.errorFallback"),
          streaming: false,
          error: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, pushMessage, updateMessage, setIsLoading, locale, pathname, t]
  );

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      sendMessage(reply.prompt);
    },
    [sendMessage]
  );

  const showQuickReplies = useMemo(
    () => messages.filter((m) => m.role === "user").length === 0,
    [messages]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={t("header.title")}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 top-0 z-50 flex flex-col overflow-hidden bg-background sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto sm:h-[640px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px] sm:rounded-[20px] sm:border sm:border-border sm:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.18),0_8px_24px_-12px_rgba(15,23,42,0.12)] dark:sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_8px_24px_-12px_rgba(0,0,0,0.5)]"
        >
          {/* Editorial header — flat, typography-led */}
          <div className="flex items-start justify-between gap-3 border-b border-border bg-background px-5 pt-5 pb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <SparkleIcon className="h-2.5 w-2.5" />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {t("assistant.name")}
                </p>
              </div>
              <h2 className="mt-1.5 text-[17px] font-semibold leading-tight tracking-tight text-foreground">
                {t("header.title")}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary/70" />
                </span>
                <span>{t("header.status")}</span>
                <span className="opacity-30">·</span>
                <span>{t("header.subtitle")}</span>
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={resetConversation}
                aria-label={t("header.resetLabel")}
                title={t("header.resetLabel")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <RefreshIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("header.minimizeLabel")}
                title={t("header.minimizeLabel")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 overflow-y-auto overscroll-contain bg-background px-5 py-5"
          >
            <div className="space-y-5">
              {messages.map((m) => (
                <div key={m.id} className="space-y-3">
                  <ChatMessage message={m} />
                  {m.leadCapture && !m.leadCapture.submitted && (
                    <div className="pl-9">
                      <LeadCaptureForm
                        conversation={messages}
                        locale={locale}
                        currentPath={pathname}
                        onSubmitted={() =>
                          updateMessage(m.id, {
                            leadCapture: { submitted: true },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              {showQuickReplies && (
                <div className="pt-2 pl-9">
                  <QuickReplies
                    onSelect={handleQuickReply}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border bg-background px-5 pt-3.5 pb-4">
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              autoFocus={open}
            />
            <div className="mt-2.5 flex items-center justify-between gap-3 text-[11px] text-muted/80">
              <span className="truncate">{t("disclaimer")}</span>
              <span className="shrink-0 font-medium tracking-tight">
                {t("poweredBy")}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
