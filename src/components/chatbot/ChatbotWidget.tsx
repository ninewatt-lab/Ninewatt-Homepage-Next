"use client";

import { usePathname } from "next/navigation";
import ChatbotProvider from "./ChatbotProvider";
import ChatbotFAB from "./ChatbotFAB";
import ChatbotPanel from "./ChatbotPanel";
import ChatbotTeaser from "./ChatbotTeaser";

// Routes where the chatbot should be hidden (path suffix match, locale-agnostic)
const HIDDEN_PATH_SUFFIXES = ["/contact"];

export default function ChatbotWidget() {
  const pathname = usePathname();
  const hidden = HIDDEN_PATH_SUFFIXES.some((s) => pathname.endsWith(s));

  if (hidden) return null;

  return (
    <ChatbotProvider>
      <ChatbotFAB />
      <ChatbotTeaser />
      <ChatbotPanel />
    </ChatbotProvider>
  );
}
