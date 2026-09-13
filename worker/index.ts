// kexalo-site worker: serves the static export via ASSETS and exposes
// POST /api/chat — a streaming, knowledge-grounded company assistant.
//
// Default inference: Cloudflare Workers AI (free tier, no API key) via the
// AI binding in wrangler.jsonc. To switch to any OpenAI-compatible provider
// later (Groq, Gemini's OpenAI endpoint, OpenRouter...), set these secrets —
// no code change needed:
//   npx wrangler secret put CHAT_API_BASE   # e.g. https://api.groq.com/openai/v1
//   npx wrangler secret put CHAT_API_KEY
//   npx wrangler secret put CHAT_API_MODEL  # e.g. llama-3.3-70b-versatile

import { COMPANY_KNOWLEDGE, SYSTEM_RULES, sectionLabel } from "./knowledge";

interface Env {
  AI: { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  CHAT_API_BASE?: string;
  CHAT_API_KEY?: string;
  CHAT_API_MODEL?: string;
}

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const MAX_TOKENS = 450;
const HISTORY_LIMIT = 12; // messages sent to the model (excl. system)
const MAX_MESSAGE_CHARS = 1200;
const RATE_LIMIT = 20; // requests per minute per IP

// Best-effort per-isolate sliding window; fronted by Cloudflare anyway.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const window = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (window.length >= RATE_LIMIT) {
    hits.set(ip, window);
    return true;
  }
  window.push(now);
  hits.set(ip, window);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= 60_000)) hits.delete(key);
    }
  }
  return false;
}

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // curl / server-side
  try {
    const host = new URL(origin).hostname;
    return host === "kexalo.com" || host === "www.kexalo.com" || host === "localhost";
  } catch {
    return false;
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function parseBody(body: unknown): { messages: ChatMessage[]; section: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const { messages, section } = body as {
    messages?: unknown;
    section?: unknown;
  };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) return null;

  const cleaned: ChatMessage[] = [];
  for (const raw of messages.slice(-HISTORY_LIMIT)) {
    if (typeof raw !== "object" || raw === null) return null;
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    if (content.length > MAX_MESSAGE_CHARS) return null;
    if (role === "user" && content.trim().length === 0) return null;
    cleaned.push({ role, content });
  }
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") return null;
  return {
    messages: cleaned,
    section: typeof section === "string" ? section : "",
  };
}

function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Re-emit Workers AI's SSE (`data: {"response":"…"}`) in our own minimal
// shape (`data: {"t":"…"}`), ending with `data: [DONE]`.
async function workersAiToSse(raw: unknown): Promise<Response> {
  const source = raw as ReadableStream<Uint8Array>;
  if (!(source instanceof ReadableStream)) throw new Error("AI: no stream");

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: string) =>
        controller.enqueue(encoder.encode(payload));
      const reader = source.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const token = (JSON.parse(data) as { response?: string }).response;
              if (token) send(`data: ${JSON.stringify({ t: token })}\n\n`);
            } catch {
              // skip malformed chunk
            }
          }
        }
        send("data: [DONE]\n\n");
      } finally {
        controller.close();
      }
    },
  });
  return sseResponse(out);
}

// Optional OpenAI-compatible path (see header comment).
async function openAiCompatibleToSse(
  env: Env,
  messages: { role: string; content: string }[]
): Promise<Response> {
  const upstream = await fetch(`${env.CHAT_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.CHAT_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.CHAT_API_MODEL,
      messages,
      stream: true,
      max_tokens: MAX_TOKENS,
    }),
  });
  if (!upstream.ok || !upstream.body) {
    throw new Error(`AI upstream ${upstream.status}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: string) =>
        controller.enqueue(encoder.encode(payload));
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const delta = (
                JSON.parse(data) as {
                  choices?: { delta?: { content?: string } }[];
                }
              ).choices?.[0]?.delta?.content;
              if (delta) send(`data: ${JSON.stringify({ t: delta })}\n\n`);
            } catch {
              // skip malformed chunk
            }
          }
        }
        send("data: [DONE]\n\n");
      } finally {
        controller.close();
      }
    },
  });
  return sseResponse(out);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return Response.json({ error: "method_not_allowed" }, { status: 405 });
      }
      if (!allowedOrigin(request.headers.get("origin"))) {
        return Response.json({ error: "forbidden" }, { status: 403 });
      }
      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      if (rateLimited(ip)) {
        return Response.json({ error: "rate_limited" }, { status: 429 });
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "bad_request" }, { status: 400 });
      }
      const parsed = parseBody(body);
      if (!parsed) {
        return Response.json({ error: "bad_request" }, { status: 400 });
      }

      const system = `${SYSTEM_RULES}\n\nThe visitor is currently viewing ${sectionLabel(parsed.section)} of kexalo.com.\n\n${COMPANY_KNOWLEDGE}`;
      const modelMessages = [
        { role: "system", content: system },
        ...parsed.messages,
      ];

      try {
        if (env.CHAT_API_BASE && env.CHAT_API_KEY && env.CHAT_API_MODEL) {
          return await openAiCompatibleToSse(env, modelMessages);
        }
        const raw = await env.AI.run(MODEL, {
          messages: modelMessages,
          stream: true,
          max_tokens: MAX_TOKENS,
        });
        return await workersAiToSse(raw);
      } catch (err) {
        console.error("chat error", err);
        return Response.json({ error: "ai_unavailable" }, { status: 502 });
      }
    }

    // Everything else: the static export (404 page for unknown paths).
    return env.ASSETS.fetch(request);
  },
};

export default worker;
