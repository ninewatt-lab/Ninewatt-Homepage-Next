"use client";

import { memo } from "react";
import { SparkleIcon } from "./icons";
import type { ChatMessage as ChatMessageType } from "./types";

function renderInline(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  const regex = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
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
          className="font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary"
        >
          {match[4]}
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
        <div className="max-w-[80%] rounded-2xl bg-primary/95 px-4 py-2.5 text-[13.5px] leading-relaxed text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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
          "min-w-0 flex-1 pt-0.5 text-[13.5px] leading-relaxed",
          isError ? "text-red-700 dark:text-red-300" : "text-foreground",
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
