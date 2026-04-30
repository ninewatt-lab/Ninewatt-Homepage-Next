export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  // When set, render this message as a lead-capture form invitation
  leadCapture?: {
    submitted: boolean;
  };
  // Mark assistant message that's actively streaming
  streaming?: boolean;
  // Optional error flag for fallback rendering
  error?: boolean;
}

export interface QuickReply {
  id: string;
  label: string;
  prompt: string;
}

export interface LeadPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message?: string;
  locale: string;
  currentPath: string;
  conversation: { role: Role; content: string }[];
}
