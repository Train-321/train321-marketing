import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import { buildSystemPrompt } from "@/lib/chat-context";

export const runtime = "nodejs";
export const maxDuration = 30;

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;

export async function POST(req: NextRequest) {
  if (process.env.CHAT_AI_ENABLED === "false" || !process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "ai_disabled", reason: "AI is disabled or not configured." },
      { status: 503 }
    );
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return Response.json({ error: "no_messages" }, { status: 400 });
  }

  const messages: ModelMessage[] = incoming
    .slice(-MAX_MESSAGES)
    .filter(
      (m): m is IncomingMessage =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_CHARS_PER_MESSAGE)
    }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "invalid_messages" }, { status: 400 });
  }

  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const result = streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
      system: buildSystemPrompt(),
      messages,
      temperature: 0.4,
      onError({ error }) {
        console.error("[chat] streamText error:", error);
      }
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat] route error:", err);
    const message = err instanceof Error ? err.message : "unknown";
    return Response.json({ error: "ai_error", reason: message }, { status: 502 });
  }
}
