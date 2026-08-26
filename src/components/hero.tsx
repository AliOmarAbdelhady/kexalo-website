"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealWords } from "@/components/reveal";

const stats = [
  { value: "03", label: "Founders, one vision" },
  { value: "04", label: "Core disciplines" },
  { value: "AI", label: "First, not an afterthought" },
  { value: "24/7", label: "Partnership & support" },
];

function HeroBackdrop() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const yOrbs = useTransform(scrollY, [0, 720], [0, reduce ? 0 : 140]);
  const yGrid = useTransform(scrollY, [0, 720], [0, reduce ? 0 : 60]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Blueprint grid with radial mask */}
      <motion.div
        style={{ y: yGrid }}
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_35%,transparent_100%)]"
      />

      {/* Primary mint glow */}
      <motion.div
        style={{ y: yOrbs }}
        className="absolute -top-40 left-1/2 h-[34rem] w-[54rem] -translate-x-1/2 rounded-full opacity-25 blur-[110px] dark:opacity-30"
      >
        <div className="h-full w-full animate-aurora bg-[radial-gradient(ellipse_at_center,var(--brand),transparent_62%)]" />
      </motion.div>

      {/* Floating orbs */}
      <motion.div
        style={{ y: yOrbs }}
        className="absolute inset-0 hidden sm:block"
      >
        <div className="absolute top-[22%] left-[12%] size-3 rounded-full bg-brand animate-float shadow-[0_0_24px_6px_color-mix(in_oklch,var(--brand)_45%,transparent)]" />
        <div className="absolute top-[58%] left-[20%] size-2 rounded-full bg-brand-2 animate-float-slow" />
        <div className="absolute top-[30%] right-[16%] size-2.5 rounded-full bg-brand-2 animate-float-slow shadow-[0_0_18px_5px_color-mix(in_oklch,var(--brand-2)_40%,transparent)]" />
        <div className="absolute top-[64%] right-[24%] size-1.5 rounded-full bg-brand animate-float" />
      </motion.div>

      {/* Vertical beams */}
      <div className="absolute inset-x-0 top-0 mx-auto flex max-w-5xl justify-between px-16">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-72 w-px origin-top animate-beam bg-gradient-to-b from-transparent via-brand to-transparent"
            style={{ animationDelay: `${i * 1.1}s` }}
          />
        ))}
      </div>

      {/* Bottom fade into page background */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden pt-24 pb-16"
    >
      <HeroBackdrop />

      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border/70 glass px-4 py-1.5 text-sm text-muted-foreground"
        >
          <SparklesIcon className="size-3.5 text-brand" />
          A technology company for the AI era
          <span className="size-1 rounded-full bg-brand animate-pulse-soft" />
        </motion.div>

        <h1 className="font-heading text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          <RevealWords text="We engineer" delay={0.15} />{" "}
          <span className="text-gradient">
            <RevealWords text="intelligent software" delay={0.35} />
          </span>
          <br />
          <RevealWords text="that moves you forward." delay={0.6} />
        </h1>

        {/* Huge centered logo — 3D mark (parked by LogoTraveller) + static wordmark.
            The wordmark shifts left by half the mark's width while the 3D model is away
            (see LogoTraveller), so the name alone stays centered on the page. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative mx-auto mb-0 flex w-11/12 max-w-xl items-center justify-center sm:max-w-2xl lg:max-w-4xl"
        >
          <div
            className="absolute inset-0 -z-10 scale-110 rounded-full bg-brand/20 blur-[70px] dark:bg-brand/25"
            aria-hidden
          />
          {/* mark slot — the 3D logo parks exactly over this box while the page is at the top */}
          <div
            id="hero-logo-mark"
            aria-hidden
            className="relative aspect-[705/559] w-[29.2%] shrink-0"
          />
          <span id="hero-logo-text" className="inline-flex w-[70.67%]">
            <Image
              src="/logo-hero-text-v2.png"
              alt="Kexalo Solutions"
              width={1704}
              height={562}
              priority
              className="hidden h-auto w-full select-none drop-shadow-[0_0_28px_color-mix(in_oklch,var(--brand)_28%,transparent)] dark:block"
            />
            <Image
              src="/logo-hero-text-light-v2.png"
              alt=""
              width={1704}
              height={562}
              priority
              aria-hidden
              className="h-auto w-full select-none dark:hidden"
            />
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          Kexalo builds AI solutions, high-performance websites, mobile
          applications and complete IT services — designed, shipped and scaled
          by one dedicated team.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            render={<a href="#contact" />}
            size="lg"
            className="group h-12 rounded-full bg-brand px-7 text-base font-semibold text-primary-foreground glow-brand transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start a project
            <ArrowUpRightIcon className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
          <Button
            render={<a href="#services" />}
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-border/80 px-7 text-base font-medium backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--brand)_50%,transparent)]"
          >
            Explore our services
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.dl
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center gap-1.5 bg-card/80 px-4 py-5 backdrop-blur transition-colors duration-300 hover:bg-accent/40"
            >
              <dt className="order-2 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </dt>
              <dd className="order-1 font-heading text-2xl font-semibold text-gradient sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#services"
        aria-label="Scroll to services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-brand md:flex"
      >
        <span className="text-[0.65rem] font-medium tracking-[0.22em] uppercase">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDownIcon className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
