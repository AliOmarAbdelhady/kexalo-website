"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Logo3DMotion } from "@/components/logo3d-scene";

const Logo3DScene = dynamic(() => import("@/components/logo3d-scene"), {
  ssr: false,
  loading: () => null,
});

// The 3D artwork aspect (width / height) used to contain-fit the model over the hero slot.
const MODEL_ASPECT = 1.341;
const RAIL: "right" | "left" = "right"; // flip to "left" to stick the travelling logo to the left edge
const FALLBACK_BRAND = "#3fe3ae";

// The journey only runs where the page has a genuinely empty margin. Sections are a
// centered max-w-6xl (72rem) column with px-6 padding, so the empty gutter beside the
// content is vw/2 - 552px. The model travels THERE and nowhere else — never across
// text — and it hugs the right edge of the screen.
const EDGE_PAD = 8; // gap between the model and the screen edge / content column edge
const TRAVEL_MAX_H = 170; // px cap for the travelling model height
const TRAVEL_MIN_H = 64; // below this the model is unreadable — stay docked in the hero instead
const TRAVEL_W_PER_H = 1.75; // travel footprint width per height, incl. rotation margin
const HALO_PER_H = 2.2; // halo diameter as a multiple of the model height

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Edge of the page's content column (max-w-6xl sections, px-4 sm:px-6 padding) on the
// travel side; the empty margin is the viewport span between this edge and the screen.
function contentEdge(vw: number): number {
  const half = vw / 2;
  const right = half + Math.min(576, Math.max(0, half - 24));
  return RAIL === "left" ? vw - right : right;
}

// Width available for the travelling model inside the empty margin (both edge pads applied).
function travelWidth(vw: number): number {
  const edge = contentEdge(vw);
  return (RAIL === "left" ? edge : vw - edge) - EDGE_PAD * 2;
}

// Canvas DPR: slight supersampling on 1x screens, capped at native-ish 2x — 3x was
// melting GPUs (2.25x more pixels per frame for no visible gain).
function canvasDpr(): number {
  return clamp((window.devicePixelRatio || 1) * 1.25, 1.25, 2);
}

// Read the resolved --brand token and convert it (oklch etc.) to #rrggbb via canvas.
function resolveBrandHex(): string {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();
    if (!raw) return FALLBACK_BRAND;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return FALLBACK_BRAND;
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
  } catch {
    return FALLBACK_BRAND;
  }
}

export function LogoTraveller() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const theme: "dark" | "light" = resolvedTheme === "light" ? "light" : "dark";

  // exact site brand mint for the chevron, resolved from the live CSS token
  const [brandHex, setBrandHex] = React.useState(FALLBACK_BRAND);
  React.useEffect(() => {
    // resolve after paint — DOM reads can't run during render
    const raf = requestAnimationFrame(() => setBrandHex(resolveBrandHex()));
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  // "in-flow" screens render the scene INSIDE the hero lockup (natively scrolled, zero
  // lag): small screens, and desktops whose empty right gutter can't fit a readable
  // travelling model. Large screens use the fixed travelling overlay, confined to the
  // empty gutter.
  const [inFlow, setInFlow] = React.useState(false);
  const [slotEl, setSlotEl] = React.useState<HTMLElement | null>(null);
  const inFlowRef = React.useRef(false);

  // keep first paint light: the three.js chunk + WebGL init start only once the page
  // has loaded and the main thread goes idle
  const [sceneOn, setSceneOn] = React.useState(false);
  React.useEffect(() => {
    let idleId = 0;
    let toId = 0;
    const allow = () => setSceneOn(true);
    const kick = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(allow, { timeout: 2500 });
      } else {
        toId = window.setTimeout(allow, 1200);
      }
    };
    if (document.readyState === "complete") {
      kick();
    } else {
      window.addEventListener("load", kick, { once: true });
      toId = window.setTimeout(kick, 4000); // load can stall on slow third parties
    }
    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      if (toId) window.clearTimeout(toId);
      window.removeEventListener("load", kick);
    };
  }, []);

  const motionRef = React.useRef<Logo3DMotion>({
    u: 0,
    vel: 0,
    dock: 1,
    gTravel: 1,
    gPark: 1,
    reduce: false,
    inFlow: false,
  });
  const [layout, setLayout] = React.useState({ w: 320, h: 320, dpr: 2, ready: false });

  React.useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setReduce = () => { motionRef.current.reduce = reduceQuery.matches; };
    setReduce();
    reduceQuery.addEventListener("change", setReduce);

    const mobileQuery = window.matchMedia("(max-width: 767px)");

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let side = 320;
    let travelH = 0; // travelling model height — sized to fit the empty gutter
    let parkH = 140; // parked model height — contain-fits the hero mark slot
    let maxScroll = 1;

    // decide the mode + travel size from the current viewport
    const evalMode = () => {
      vw = window.innerWidth;
      travelH = clamp(travelWidth(vw) / TRAVEL_W_PER_H, 0, TRAVEL_MAX_H);
      inFlowRef.current = mobileQuery.matches || travelH < TRAVEL_MIN_H;
      motionRef.current.inFlow = inFlowRef.current;
    };
    const syncFlowState = () => {
      requestAnimationFrame(() => setInFlow(inFlowRef.current));
    };

    // canvas sizing for the active mode; recomputed lazily because the hero entrance
    // animation rescales the slot early on
    const computeSizes = () => {
      const slot = document.getElementById("hero-logo-mark");
      if (!slot) return null;
      const r = slot.getBoundingClientRect();
      parkH = Math.max(40, Math.min(r.height, r.width / MODEL_ASPECT));
      if (inFlowRef.current) {
        // in-flow canvas exactly fills the mark slot
        return { side: Math.round(r.height), slotW: r.width, slotH: r.height };
      }
      return { side: Math.round(Math.max(travelH, parkH) * 2.24), slotW: r.width, slotH: r.height };
    };

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      evalMode();
      syncFlowState();
      setSlotEl((prev) => prev ?? document.getElementById("hero-logo-mark"));

      const sizes = computeSizes();
      if (!sizes) return;
      side = sizes.side;

      const k = 0.2782; // rendered model height per unit of WebGL group scale, as a fraction of canvas height
      if (inFlowRef.current) {
        motionRef.current.gPark = clamp(parkH / (k * sizes.slotH), 0.3, 2.4);
        motionRef.current.gTravel = motionRef.current.gPark;
        setLayout((prev) =>
          prev.ready && Math.abs(prev.w - sizes.slotW) < 2 && Math.abs(prev.h - sizes.slotH) < 2
            ? prev
            : { w: Math.round(sizes.slotW), h: Math.round(sizes.slotH), dpr: canvasDpr(), ready: true },
        );
      } else {
        motionRef.current.gTravel = clamp(travelH / (k * side), 0.3, 2.4);
        motionRef.current.gPark = clamp(parkH / (k * side), 0.3, 2.4);
        setLayout((prev) =>
          prev.ready && Math.abs(prev.w - side) < 2 && Math.abs(prev.h - side) < 2
            ? prev
            : { w: side, h: side, dpr: canvasDpr(), ready: true },
        );
      }
    };
    const initialRaf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);

    let raf = 0;
    let prevY = window.scrollY;
    let velEma = 0;
    let frame = 0;
    let first = true;
    let reveal = 0; // first-load fade-in of the whole travelling overlay
    // only touch the DOM when a value actually moved — avoids repainting the blurred glow every frame
    let lastX = NaN, lastY = NaN, lastVis = -1, lastGlowO = -1, lastGlowS = -1;
    let textDock = 1, lastTextTx = -999;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;
      const y = window.scrollY;
      const dy = y - prevY;
      prevY = y;
      velEma = velEma * 0.8 + dy * 0.2;
      if (frame % 90 === 0) maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      // self-correct sizing after late layout shifts (hero entrance animation, font load)
      if (frame % 45 === 0) {
        const next = computeSizes();
        if (next && Math.abs(next.side - side) > 2) measure();
      }

      const reduce = motionRef.current.reduce;
      const u = clamp(y / maxScroll, 0, 1);
      // in-flow / reduced motion: always parked — the in-flow canvas scrolls natively, zero lag
      const dock = reduce || motionRef.current.inFlow ? 1 : smoothstep(clamp(1 - y / 150, 0, 1));

      motionRef.current.u = u;
      motionRef.current.vel = velEma;
      motionRef.current.dock = dock;

      if (inFlowRef.current) {
        // in-flow mode: the canvas is part of the hero — nothing to position
        if (first) { first = false; }
        return;
      }

      const wrap = wrapRef.current;
      if (!wrap || side <= 0) return;

      // park position: the mark slot inside the centered hero lockup
      const slot = document.getElementById("hero-logo-mark");
      const half = side / 2;
      let parkCx = half + 24;
      let parkCy = half + 8;
      if (slot) {
        const r = slot.getBoundingClientRect();
        parkCx = r.left + r.width / 2;
        parkCy = r.top + r.height / 2;
      }

      // travel: hug the right screen edge inside the empty margin beside the content
      // column — the model never crosses onto text, it rides the blank edge down the page
      const usableW = travelWidth(vw);
      const footprint = travelH * TRAVEL_W_PER_H;
      const railCx = RAIL === "left" ? EDGE_PAD + footprint / 2 : vw - EDGE_PAD - footprint / 2;
      const wiggleAmp = Math.min(9, Math.max(0, (usableW - footprint) / 2));
      const travelCx = railCx + Math.sin(u * Math.PI * 5) * wiggleAmp; // subtle wiggle inside the gutter
      const travelCy = lerp(vh * 0.2, vh - half - 44, smoothstep(u));

      const cx = lerp(travelCx, parkCx, dock);
      const cy = lerp(travelCy, parkCy, dock);

      // translate only — all scaling happens inside WebGL so the canvas is never measured scaled
      const tx = cx - half;
      const ty = cy - half;
      if (tx !== lastX || ty !== lastY) {
        lastX = tx;
        lastY = ty;
        wrap.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      }

      // hand-off visibility: the model dissolves while it crosses the hero wordmark
      // between the park slot and the rail — it is never SEEN over text
      // (visible parked at dock≈1 and travelling at dock≈0, invisible in between)
      const fade =
        1 -
        clamp(Math.min((dock - 0.08) / 0.08, (0.97 - dock) / 0.08), 0, 1);
      reveal += (1 - reveal) * 0.1;
      const vis = reveal * fade;
      if (first) {
        first = false;
        lastVis = -1; // force the first opacity write
      }
      if (Math.abs(vis - lastVis) > 0.02) {
        lastVis = vis;
        wrap.style.opacity = vis.toFixed(3);
      }

      if (glowRef.current) {
        const speed = Math.min(Math.abs(velEma), 120);
        const gOpacity = (0.35 + Math.min(0.45, speed * 0.003)) * (1 - dock * 0.8) * fade * reveal;
        // halo tracks the model's pixel size (not the canvas), so the glow stays over
        // the blank margin instead of washing across the content column
        const gScale = (lerp(travelH, parkH, dock) * HALO_PER_H) / (side * 1.36);
        if (Math.abs(gOpacity - lastGlowO) > 0.02 || Math.abs(gScale - lastGlowS) > 0.004) {
          lastGlowO = gOpacity;
          lastGlowS = gScale;
          glowRef.current.style.opacity = gOpacity.toFixed(3);
          glowRef.current.style.transform = `scale(${gScale.toFixed(4)})`;
        }
      }

      // wordmark rebalance: at the top the lockup sits together, centered as a whole
      // (name at its natural flex spot, right of the mark); when the model leaves, the
      // name slides LEFT by half the mark's width so the name alone is page-centered;
      // slides right again as the model returns
      const heroText = document.getElementById("hero-logo-text");
      if (heroText) {
        textDock += (dock - textDock) * 0.15;
        const tx = (1 - textDock) * -20.65; // % of the wordmark's own width == half the mark slot
        if (Math.abs(tx - lastTextTx) > 0.05) {
          lastTextTx = tx;
          heroText.style.transform = `translateX(${tx.toFixed(2)}%)`;
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      reduceQuery.removeEventListener("change", setReduce);
      cancelAnimationFrame(initialRaf);
    };
  }, []);

  const scene = sceneOn && layout.ready ? (
    <Logo3DScene motionRef={motionRef} theme={theme} brandHex={brandHex} dpr={layout.dpr} />
  ) : null;

  if (inFlow && slotEl) {
    // in-flow: rendered inside the hero mark slot — the browser scrolls it natively (zero lag)
    return createPortal(
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: sceneOn && layout.ready ? 1 : 0, transition: "opacity 500ms" }}
      >
        <div
          className="absolute inset-[-12%] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--brand) 55%, transparent), transparent 65%)",
            opacity: 0.55,
          }}
        />
        {scene}
      </div>,
      slotEl,
    );
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 opacity-0 will-change-transform"
      style={{ width: layout.w, height: layout.h }}
    >
      {/* mint halo behind the model — sized to the model in the tick, not the canvas */}
      <div
        ref={glowRef}
        className="absolute -inset-[18%] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--brand) 55%, transparent), transparent 65%)",
        }}
      />
      {scene}
    </div>
  );
}
