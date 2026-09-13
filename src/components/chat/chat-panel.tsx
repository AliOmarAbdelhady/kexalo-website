"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpIcon,
  Building2Icon,
  LayersIcon,
  RocketIcon,
  SquareIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { detectSection } from "./section";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "thinking" | "streaming";

const SUGGESTIONS = [
  { icon: Building2Icon, label: "What is Kexalo?" },
  { icon: UsersIcon, label: "Who are the founders?" },
  { icon: LayersIcon, label: "What services do you offer?" },
  { icon: RocketIcon, label: "How do I start a project?" },
];

function KBadge({ size = "size-6", text = "text-[11px]" }: { size?: string; text?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-2 font-heading font-bold text-primary-foreground shadow-sm ${size} ${text}`}
    >
      K
    </div>
  );
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(
    /(\*\*[^*]+\*\*|`[^`]+`|hello@kexalo\.com|https?:\/\/[^\s)]+)/g
  );
  return parts
    .filter((part) => part.length > 0)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={key}
            className="rounded bg-accent/60 px-1 py-0.5 font-mono text-[0.85em]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part === "hello@kexalo.com") {
        return (
          <a
            key={key}
            href="mailto:hello@kexalo.com"
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            {part}
          </a>
        );
      }
      if (part.startsWith("http")) {
        return (
          <a
            key={key}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
}

// Tiny markdown-ish renderer: **bold**, `code`, links/emails, "- " bullets.
function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const isBullet = /^\s*[-•*]\s+/.test(line);
        const content = isBullet ? line.replace(/^\s*[-•*]\s+/, "") : line;
        if (!content.trim()) return null;
        return isBullet ? (
          <div key={i} className="flex gap-2">
            <span
              aria-hidden
              className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-brand"
            />
            <span>{renderInline(content, `b${i}`)}</span>
          </div>
        ) : (
          <p key={i}>{renderInline(content, `p${i}`)}</p>
        );
      })}
    </div>
  );
}

const Caret = () => (
  <span
    aria-hidden
    className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-[2px] animate-pulse-soft rounded-[2px] bg-brand"
  />
);

export default function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [status, setStatus] = React.useState<Status>("idle");
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const busy = status !== "idle";

  // Stick to the bottom while streaming unless the visitor scrolled up to re-read.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const send = React.useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, 1200);
      if (!content || abortRef.current) return;

      setInput("");
      const history = [...messages, { role: "user" as const, content }];
      setMessages(history);
      setStatus("thinking");

      const controller = new AbortController();
      abortRef.current = controller;
      const appendToken = (t: string) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + t };
          return next;
        });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history.slice(-12),
            section: detectSection(),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`status ${res.status}`);

        setStatus("streaming");
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const token = (JSON.parse(data) as { t?: string }).t;
              if (token) appendToken(token);
            } catch {
              // skip malformed chunk
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // keep any partial answer
        } else {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.content.length > 0) return prev;
            return [
              ...prev,
              {
                role: "assistant",
                content:
                  "I'm having trouble connecting right now — please try again in a moment, or email hello@kexalo.com and the founders will get right back to you.",
              },
            ];
          });
        }
      } finally {
        abortRef.current = null;
        setStatus("idle");
      }
    },
    [messages]
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Kexalo AI chat"
          initial={{ opacity: 0, y: 18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="fixed right-3 bottom-20 z-[70] flex h-[min(36rem,80dvh)] w-[min(24rem,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-border/40 bg-card/25 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 sm:right-6 sm:bottom-24"
        >
          {/* ambient brand glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-28 left-1/2 h-56 w-[130%] -translate-x-1/2 animate-aurora rounded-full bg-brand/25 blur-[80px]"
          />

          {/* header */}
          <div className="relative flex items-center gap-3 border-b border-border/50 bg-card/40 px-4 py-3 backdrop-blur-md">
            <div className="relative">
              {busy && (
                <span
                  aria-hidden
                  className="absolute -inset-1 animate-pulse-soft rounded-xl bg-brand/40 blur-sm"
                />
              )}
              <KBadge size="size-9 rounded-xl" text="text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-semibold tracking-tight">
                Kexalo AI
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 animate-pulse-soft rounded-full bg-brand" />
                Online — instant answers
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          {/* messages */}
          {messages.length === 0 ? (
            <div className="relative flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 py-4 text-center">
              <div className="relative mt-auto">
                <span
                  aria-hidden
                  className="absolute -inset-3 animate-pulse-soft rounded-3xl bg-brand/25 blur-lg"
                />
                <KBadge size="size-14 rounded-2xl" text="text-2xl" />
              </div>
              <div>
                <p className="font-heading text-base font-semibold tracking-tight">
                  Hey! I&apos;m Kexalo AI ⚡
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Ask me anything about Kexalo — what we build, who we are, or
                  how to start a project.
                </p>
              </div>
              <div className="grid w-full max-w-[17rem] grid-cols-1 gap-2 mb-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => void send(s.label)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 text-left text-[13px] text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-foreground"
                  >
                    <s.icon className="size-3.5 shrink-0 text-brand" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              aria-live="polite"
              className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4 min-h-0"
            >
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md border border-brand/30 bg-brand/20 px-3.5 py-2.5 text-sm leading-relaxed backdrop-blur-md">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-end gap-2">
                    <KBadge />
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border/50 bg-card/80 px-3.5 py-2.5 text-sm leading-relaxed backdrop-blur">
                      {m.content.length > 0 ? (
                        <>
                          <Rich text={m.content} />
                          {i === messages.length - 1 && status === "streaming" && (
                            <Caret />
                          )}
                        </>
                      ) : (
                        status === "streaming" && <Caret />
                      )}
                    </div>
                  </div>
                )
              )}
              {status === "thinking" && (
                <div className="flex items-end gap-2">
                  <KBadge />
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/50 bg-card/80 px-4 py-3 backdrop-blur">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-1.5 animate-pulse-soft rounded-full bg-brand"
                        style={{ animationDelay: `${i * 180}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* composer */}
          <div className="relative border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Kexalo…"
                maxLength={1200}
                autoComplete="off"
                disabled={busy}
                className="h-11 min-w-0 flex-1 rounded-full border border-border/60 bg-background/60 px-4 text-[16px] outline-none transition-colors backdrop-blur-sm placeholder:text-muted-foreground/70 focus:border-brand/60 disabled:opacity-50 sm:text-sm"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop generating"
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-accent/40 text-foreground transition-colors hover:border-brand/50"
                >
                  <SquareIcon className="size-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="glow-brand flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
                >
                  <ArrowUpIcon className="size-4" />
                </button>
              )}
            </form>
            <p className="pb-2 text-center text-[10px] text-muted-foreground/70">
              Answers are AI-generated from kexalo.com content
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
