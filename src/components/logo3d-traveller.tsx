"use client";

import * as React from "react";
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

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

  const motionRef = React.useRef<Logo3DMotion>({
    u: 0,
    vel: 0,
    dock: 1,
    gTravel: 1,
    gPark: 1,
    reduce: false,
  });
  const [layout, setLayout] = React.useState({ side: 320, dpr: 2, ready: false });

  React.useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setReduce = () => { motionRef.current.reduce = reduceQuery.matches; };
    setReduce();
    reduceQuery.addEventListener("change", setReduce);

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let side = 320;
    let modelH = 140;
    let maxScroll = 1;

    // canvas must frame both the travelling size and the (bigger) hero park size;
    // recomputed lazily because the hero entrance animation rescales the slot early on
    const computeSizes = () => {
      modelH = clamp(Math.min(vh * 0.17, vw * 0.26), 90, 170);
      const slot = document.getElementById("hero-logo-mark");
      let parkH = modelH;
      if (slot) {
        const r = slot.getBoundingClientRect();
        parkH = Math.max(40, Math.min(r.height, r.width / MODEL_ASPECT));
      }
      return { side: Math.round(Math.max(modelH, parkH) * 2.24), parkH };
    };

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const { side: s, parkH } = computeSizes();
      side = s;

      const k = 0.2782; // rendered model height per unit of WebGL group scale, as a fraction of `side`
      motionRef.current.gTravel = clamp(modelH / (k * side), 0.3, 2.4);
      motionRef.current.gPark = clamp(parkH / (k * side), 0.3, 2.4);

      setLayout((prev) =>
        Math.abs(prev.side - side) < 2 && prev.ready
          ? prev
          : { side, dpr: Math.min(3, (window.devicePixelRatio || 1) * 1.5), ready: true },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);

    let raf = 0;
    let prevY = window.scrollY;
    let velEma = 0;
    let frame = 0;
    let first = true;
    // only touch the DOM when a value actually moved — avoids repainting the blurred glow every frame
    let lastX = NaN, lastY = NaN, lastGlowO = -1, lastGlowS = -1;
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
        const { side: next } = computeSizes();
        if (Math.abs(next - side) > 2) measure();
      }

      const wrap = wrapRef.current;
      if (!wrap || side <= 0) return;

      const reduce = motionRef.current.reduce;
      const u = clamp(y / maxScroll, 0, 1);
      const dock = reduce ? 1 : smoothstep(clamp(1 - y / 150, 0, 1));

      motionRef.current.u = u;
      motionRef.current.vel = velEma;
      motionRef.current.dock = dock;

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

      // travel: stick to the side rail, ride down with the scroll
      const inset = vw < 640 ? 10 : 18;
      const railX = RAIL === "left" ? half + inset : vw - half - inset;
      const travelCx = railX + Math.sin(u * Math.PI * 5) * 9; // subtle wiggle while stuck to the rail
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

      if (glowRef.current) {
        const speed = Math.min(Math.abs(velEma), 120);
        const gOpacity = (0.35 + Math.min(0.45, speed * 0.003)) * (1 - dock * 0.8);
        const gScale = lerp(motionRef.current.gTravel, motionRef.current.gPark, dock) * 0.75;
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

      if (first) {
        first = false;
        wrap.style.opacity = "1";
      }
    };    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      reduceQuery.removeEventListener("change", setReduce);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 opacity-0 transition-opacity duration-500 will-change-transform"
      style={{ width: layout.side, height: layout.side }}
    >
      {/* mint halo behind the model */}
      <div
        ref={glowRef}
        className="absolute -inset-[18%] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--brand) 55%, transparent), transparent 65%)",
        }}
      />
      {layout.ready ? (
        <Logo3DScene
          motionRef={motionRef}
          theme={theme}
          brandHex={brandHex}
          side={layout.side}
          dpr={layout.dpr}
        />
      ) : null}
    </div>
  );
}
