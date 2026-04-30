"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChatMessage } from "./types";

const STORAGE_KEY = "ninewatt-chat-session";
const STORAGE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const MAX_HISTORY = 20;

interface PersistedSession {
  sessionId: string;
  messages: ChatMessage[];
  updatedAt: number;
}

interface ChatbotContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  messages: ChatMessage[];
  pushMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  resetConversation: () => void;
  sessionId: string;
  isLoading: boolean;
  setIsLoading: (next: boolean) => void;
  hasGreeted: boolean;
  markGreeted: () => void;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used within ChatbotProvider");
  return ctx;
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatbotProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedSession;
        const fresh = Date.now() - parsed.updatedAt < STORAGE_TTL_MS;
        if (fresh && parsed.sessionId) {
          setSessionId(parsed.sessionId);
          setMessages(parsed.messages ?? []);
          setHasGreeted((parsed.messages ?? []).length > 0);
          hydrated.current = true;
          return;
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setSessionId(genId());
    hydrated.current = true;
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated.current || !sessionId) return;
    try {
      const payload: PersistedSession = {
        sessionId,
        messages: messages.slice(-MAX_HISTORY),
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage may be full or disabled
    }
  }, [messages, sessionId]);

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg].slice(-MAX_HISTORY));
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  const resetConversation = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    setSessionId(genId());
  }, []);

  const markGreeted = useCallback(() => setHasGreeted(true), []);

  const value = useMemo<ChatbotContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((p) => !p),
      messages,
      pushMessage,
      updateMessage,
      resetConversation,
      sessionId,
      isLoading,
      setIsLoading,
      hasGreeted,
      markGreeted,
    }),
    [
      open,
      messages,
      pushMessage,
      updateMessage,
      resetConversation,
      sessionId,
      isLoading,
      hasGreeted,
      markGreeted,
    ]
  );

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
}

export { genId };
