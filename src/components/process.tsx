"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  CompassIcon,
  PenToolIcon,
  CodeXmlIcon,
  RocketIcon,
  TrendingUpIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/reveal";

const steps = [
  {
    icon: CompassIcon,
    step: "01",
    title: "Discover",
    description:
      "We dig into your goals, users and constraints to define the sharpest possible scope.",
  },
  {
    icon: PenToolIcon,
    step: "02",
    title: "Design",
    description:
      "Architecture, UX flows and interfaces take shape — reviewed with you, iteration by iteration.",
  },
  {
    icon: CodeXmlIcon,
    step: "03",
    title: "Build",
    description:
      "Clean, tested code in short cycles. You watch the product grow week by week.",
  },
  {
    icon: RocketIcon,
    step: "04",
    title: "Launch",
    description:
      "Hardening, performance passes and a smooth release onto the web, the stores and your infrastructure.",
  },
  {
    icon: TrendingUpIcon,
    step: "05",
    title: "Scale",
    description:
      "Monitoring, iteration and new capabilities as your product finds its market.",
  },
];

export function Process() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.72", "end 0.55"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-28"
    >
      {/* ambient backdrop */}
      <div
        className="absolute inset-0 -z-10 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How we work"
          title={
            <>
              A process built for <span className="text-gradient">momentum</span>
            </>
          }
          description="No black boxes and no endless discovery phases — five clear stages from first conversation to long-term growth."
        />

        <div className="relative mt-16">
          {/* Track + progress line (desktop) */}
          <div
            className="absolute top-6 right-[10%] left-[10%] hidden h-px bg-border lg:block"
            aria-hidden
          >
            <motion.div
              style={{ scaleX: progress }}
              className="h-full origin-left bg-gradient-to-r from-brand via-brand-2 to-brand"
            />
          </div>

          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {steps.map((item, i) => (
              <motion.li
                key={item.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-56px" }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.12,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="group relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <div className="relative z-10 flex size-12 items-center justify-center rounded-2xl border border-brand/30 bg-card text-brand shadow-[0_0_0_6px_var(--background)] transition-all duration-500 group-hover:scale-110 group-hover:border-brand/60 group-hover:glow-brand">
                  <item.icon className="size-5" />
                </div>
                <span className="mt-5 font-mono text-xs tracking-[0.28em] text-brand/80">
                  {item.step}
                </span>
                <h3 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
