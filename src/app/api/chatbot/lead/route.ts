import { NextResponse } from "next/server";
import { checkRateLimit, sweepIfNeeded } from "@/lib/chatbot/rateLimit";

export const runtime = "nodejs";

const HOUR_MS = 60 * 60 * 1000;

interface LeadBody {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  locale?: string;
  currentPath?: string;
  conversation?: { role: string; content: string }[];
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function summarizeConversation(
  convo: { role: string; content: string }[] | undefined
): string {
  if (!convo || convo.length === 0) return "-";
  return convo
    .slice(-6)
    .map(
      (m) =>
        `${m.role === "user" ? "👤" : "🤖"} ${String(m.content).slice(0, 240)}`
    )
    .join("\n");
}

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  const company = (body.company ?? "").toString().trim();
  const phone = (body.phone ?? "").toString().trim();
  const message = (body.message ?? "").toString().trim();
  const locale = (body.locale ?? "ko").toString().slice(0, 8);
  const currentPath = (body.currentPath ?? "/").toString().slice(0, 200);

  if (!name || name.length > 80) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (!isValidEmail(email) || email.length > 120) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (company.length > 120 || phone.length > 40 || message.length > 500) {
    return NextResponse.json({ error: "Field too long" }, { status: 400 });
  }

  const ip = getClientIp(req);
  sweepIfNeeded(HOUR_MS);
  const rl = checkRateLimit(`chatbot-lead:${ip}`, 5, HOUR_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec ?? 60) },
      }
    );
  }

  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("TEAMS_WEBHOOK_URL not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const composedMessage = [
    `[챗봇 유입] (${locale}) 페이지: ${currentPath}`,
    message ? `\n${message}` : "",
    `\n\n— 대화 요약 —\n${summarizeConversation(body.conversation)}`,
  ].join("");

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        company: company || "-",
        email,
        phone: phone || "-",
        type: "챗봇 상담",
        message: composedMessage,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Teams webhook failed:", res.status, text);
      return NextResponse.json(
        { error: "Send failed" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("chatbot lead error:", err);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
