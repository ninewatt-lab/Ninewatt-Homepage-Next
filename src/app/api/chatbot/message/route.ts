import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, sweepIfNeeded } from "@/lib/chatbot/rateLimit";
import {
  COMPANY_KNOWLEDGE,
  SYSTEM_INSTRUCTIONS,
  buildDynamicPreamble,
} from "@/lib/chatbot/systemPrompt";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5";
const MAX_OUTPUT_TOKENS = 500;
const MAX_INPUT_CHARS = 1000;
const MAX_HISTORY = 12;
const RATE_LIMIT_PER_HOUR = 20;
const HOUR_MS = 60 * 60 * 1000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: IncomingMessage[];
  locale: string;
  currentPath: string;
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function safeMessages(input: IncomingMessage[]): IncomingMessage[] {
  return input
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_INPUT_CHARS) }));
}

function jsonLine(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return NextResponse.json(
      { error: "Chatbot not configured." },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = safeMessages(body.messages ?? []);
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  const ip = getClientIp(req);
  sweepIfNeeded(HOUR_MS);
  const rl = checkRateLimit(`chatbot:${ip}`, RATE_LIMIT_PER_HOUR, HOUR_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfterSec ?? 60),
        },
      }
    );
  }

  const locale = typeof body.locale === "string" ? body.locale : "ko";
  const currentPath =
    typeof body.currentPath === "string" ? body.currentPath.slice(0, 200) : "/";

  const client = new Anthropic({ apiKey });

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_INSTRUCTIONS,
    },
    {
      type: "text",
      text: COMPANY_KNOWLEDGE,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: buildDynamicPreamble({ locale, currentPath }),
    },
  ];

  const tools: Anthropic.Messages.Tool[] = [
    {
      name: "request_consultation",
      description:
        "Use this tool when the user expresses clear interest in a quote, demo, pricing, getting started, or talking with sales. After calling this tool, the user will see a contact form rendered in the chat. Do not ask for contact details in free text — always use this tool.",
      input_schema: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description:
              "Short summary (one sentence) of what the user is interested in.",
          },
        },
        required: ["reason"],
      },
    },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: systemBlocks,
          tools,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              jsonLine({ type: "text", delta: event.delta.text })
            );
          } else if (
            event.type === "content_block_start" &&
            event.content_block.type === "tool_use" &&
            event.content_block.name === "request_consultation"
          ) {
            controller.enqueue(jsonLine({ type: "lead_capture" }));
          }
        }

        controller.close();
      } catch (err) {
        console.error("chatbot stream error:", err);
        try {
          controller.enqueue(
            jsonLine({ type: "error", message: "stream_failed" })
          );
        } catch {
          // controller may already be closed
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
