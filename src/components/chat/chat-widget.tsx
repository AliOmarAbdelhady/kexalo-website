"use client";

import * as React from "react";
import nextDynamic from "next/dynamic";
import { motion } from "motion/react";

// The panel (and its logic) lives in its own chunk: the launcher below is all
// that renders up front. The chunk is prefetched on idle so opening feels
// instant, but nothing chat-related blocks first paint.
const panelLoader = () => import("./chat-panel");
const ChatPanel = nextDynamic(panelLoader, { ssr: false });

const NUDGE_KEY = "kx-ai-nudged";

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [panelMounted, setPanelMounted] = React.useState(false);
  const [nudge, setNudge] = React.useState(false);

  // Warm the panel chunk once the page has settled (mirrors the three.js deferral).
  React.useEffect(() => {
    const warm = () => void panelLoader();
    let idleId = 0;
    let timeoutId = 0;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(warm, 4000);
    }
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  // One-time nudge per session, a few seconds after landing.
  React.useEffect(() => {
    if (sessionStorage.getItem(NUDGE_KEY)) return;
    const show = window.setTimeout(() => {
      setNudge(true);
      sessionStorage.setItem(NUDGE_KEY, "1");
    }, 6000);
    const hide = window.setTimeout(() => setNudge(false), 18000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const openChat = React.useCallback(() => {
    setPanelMounted(true);
    setNudge(false);
    setOpen(true);
  }, []);

  const toggleChat = React.useCallback(() => {
    // mount the panel chunk on first open, whichever path opens it
    setPanelMounted(true);
    setNudge(false);
    setOpen((o) => !o);
  }, []);

  // ⌘K / Ctrl+K toggles the chat.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleChat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleChat]);

  return (
    <>
      {panelMounted && <ChatPanel open={open} onClose={() => setOpen(false)} />}

      <div className="fixed right-3 bottom-4 z-[70] flex items-end gap-3 sm:right-6 sm:bottom-6">
        {nudge && !open && (
          <motion.button
            type="button"
            onClick={openChat}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative mb-1 hidden max-w-56 cursor-pointer rounded-2xl rounded-br-md border border-border/60 glass px-4 py-2.5 text-left text-sm text-foreground shadow-lg sm:block"
          >
            <span className="absolute -top-1.5 left-1/2 size-1.5 rounded-full bg-brand animate-pulse-soft" />
            <span className="font-medium">Questions?</span>{" "}
            <span className="text-muted-foreground">
              Ask our AI — it knows Kexalo inside out.
            </span>
          </motion.button>
        )}

        <button
          type="button"
          onClick={() => (open ? setOpen(false) : toggleChat())}
          aria-label={open ? "Close Kexalo AI chat" : "Chat with Kexalo AI"}
          className="group relative flex size-14 cursor-pointer items-center justify-center rounded-full border border-brand/40 bg-card/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/70 hover:shadow-[0_0_32px_-6px_color-mix(in_oklch,var(--brand)_55%,transparent)]"
        >
          {/* breathing halo + slow orbit ring — the launcher is a tiny "star" */}
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full bg-brand/20 blur-md animate-pulse-soft"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border border-dashed border-brand/30 animate-[spin_14s_linear_infinite] group-hover:border-brand/60"
          />
          <span className="relative font-heading text-xl font-bold text-gradient select-none">
            K
          </span>
          {/* spark */}
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center"
          >
            <span className="absolute inset-0 rounded-full bg-brand opacity-60 animate-ping" />
            <span className="relative size-2 rounded-full bg-brand shadow-[0_0_10px_2px_color-mix(in_oklch,var(--brand)_60%,transparent)]" />
          </span>
          {/* hover label (desktop) */}
          <span className="pointer-events-none absolute right-full mr-3 hidden items-center rounded-full border border-border/60 glass px-3.5 py-1.5 text-sm font-medium whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
            Ask Kexalo AI
          </span>
        </button>
      </div>
    </>
  );
}
