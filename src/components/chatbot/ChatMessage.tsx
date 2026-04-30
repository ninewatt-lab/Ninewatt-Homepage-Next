"use client";

import { memo } from "react";
import { SparkleIcon } from "./icons";
import type { ChatMessage as ChatMessageType } from "./types";

function renderInline(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  // Match **bold** or [label](href). Allow optional whitespace between ] and (
  // because the model occasionally inserts a space or zero-width separator.
  const regex = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\s*\(([^)\s]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={`b-${i++}`} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      const href = match[5];
      const isInternal = href.startsWith("/") || href.startsWith("#");
      parts.push(
        <a
          key={`a-${i++}`}
          href={href}
          {...(isInternal
            ? {}
            : { target: "_blank", rel: "noopener noreferrer" })}
          className="inline-flex items-baseline gap-0.5 font-semibold text-primary underline decoration-primary decoration-2 underline-offset-[3px] transition-colors hover:bg-primary/10 hover:decoration-[3px] rounded-xs -mx-0.5 px-0.5"
        >
          <span>{match[4]}</span>
          {!isInternal && (
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
              className="h-2.5 w-2.5 -translate-y-px shrink-0"
            >
              <path d="M3.5 2H10V8.5M10 2L2 10" />
            </svg>
          )}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderContent(content: string) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let currentList: string[] = [];

  const flushList = (key: number) => {
    if (currentList.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="list-none space-y-1">
        {currentList.map((line, idx) => (
          <li key={idx} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current opacity-40"
            />
            <span className="flex-1">
              {renderInline(line.replace(/^[-*]\s+/, ""))}
            </span>
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((line, idx) => {
    // Strip leading markdown heading markers (#, ##, ### ...) and render
    // the remaining text as a bold paragraph. The chat UI does not render
    // headings, so leaving the # marks would show literal "##" to users.
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList(idx);
      blocks.push(
        <p key={`h-${idx}`} className="font-semibold">
          {renderInline(headingMatch[2])}
        </p>
      );
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      currentList.push(line);
    } else {
      flushList(idx);
      if (line.trim().length > 0) {
        blocks.push(<p key={`p-${idx}`}>{renderInline(line)}</p>);
      }
    }
  });
  flushList(lines.length);
  return blocks;
}

function ChatMessageBase({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const isError = message.error;

  if (isUser) {
    return (
      <div className="flex justify-end" role="article">
        <div className="max-w-[80%] rounded-2xl bg-primary/95 px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="space-y-1.5">{renderContent(message.content)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3" role="article">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-primary"
      >
        <SparkleIcon className="h-3 w-3" />
      </span>
      <div
        className={[
          "min-w-0 flex-1 rounded-2xl border px-4 py-3 text-[15px] leading-relaxed shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          isError
            ? "border-red-200 bg-red-50/60 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            : "border-border bg-surface-elevated text-foreground",
        ].join(" ")}
      >
        <div className="space-y-2">{renderContent(message.content)}</div>
        {message.streaming && (
          <span
            className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-foreground/60 align-middle"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default memo(ChatMessageBase);
