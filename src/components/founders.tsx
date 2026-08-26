"use client";

import * as React from "react";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/reveal";

const founders = [
  {
    name: "Ali Omar",
    initials: "AO",
    role: "Co-Founder",
    focus: "Technology & AI",
    gradient: "from-brand/80 via-brand-2/70 to-transparent",
  },
  {
    name: "Marwan Mesbah",
    initials: "MM",
    role: "Co-Founder",
    focus: "Engineering & Delivery",
    gradient: "from-brand-2/80 via-brand/60 to-transparent",
  },
  {
    name: "Youssef Ibrahim",
    initials: "YI",
    role: "Co-Founder",
    focus: "Product & Solutions",
    gradient: "from-brand/70 via-brand-2/80 to-transparent",
  },
];

export function Founders() {
  return (
    <section id="founders" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-28">
      {/* ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -z-10 h-[28rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[130px] dark:bg-brand/15"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The founders"
          title={
            <>
              Three founders.{" "}
              <span className="text-gradient">One standard: excellent.</span>
            </>
          }
          description="Kexalo is led hands-on by its three founders — every project gets their direct attention, from the first architecture decision to the last deploy."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((founder, i) => (
            <motion.article
              key={founder.name}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-56px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 text-center transition-colors duration-300 hover:border-brand/40"
            >
              {/* top gradient wash */}
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${founder.gradient} opacity-[0.14] transition-opacity duration-500 group-hover:opacity-30`}
                aria-hidden
              />

              {/* Avatar with animated ring */}
              <div className="relative mx-auto size-24">
                <span
                  className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand opacity-40 blur-[6px] transition-opacity duration-500 group-hover:opacity-90"
                  aria-hidden
                />
                <span className="relative flex size-24 items-center justify-center rounded-full border border-brand/40 bg-background font-heading text-2xl font-bold tracking-wide text-gradient">
                  {founder.initials}
                </span>
              </div>

              <h3 className="mt-6 font-heading text-xl font-semibold tracking-tight">
                {founder.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-brand">
                {founder.role}
              </p>
              <p className="mt-0.5 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                {founder.focus}
              </p>

              <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-brand/60 to-transparent transition-all duration-500 group-hover:w-28" />

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Building Kexalo&apos;s products side by side with every client
                — architecture, code and delivery.
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
