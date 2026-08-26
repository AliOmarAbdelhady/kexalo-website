"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowUpRightIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export function Cta() {
  return (
    <section id="contact" className="scroll-mt-24 pb-24 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-brand/25 bg-card px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* Backdrop layers */}
            <div
              className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_70%_80%_at_50%_50%,black,transparent)]"
              aria-hidden
            />
            <div
              className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[100px] dark:bg-brand/30"
              aria-hidden
            />
            {/* Rotating conic ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute -right-40 -bottom-40 size-96 rounded-full border border-dashed border-brand/25"
              aria-hidden
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full border border-dashed border-brand-2/25"
              aria-hidden
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-brand uppercase">
                Let&apos;s talk
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.08]">
                Have an idea?{" "}
                <span className="text-gradient">Let&apos;s build it together.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground sm:text-lg">
                Tell us where you want to go — we&apos;ll bring the
                technology, the team and the momentum to get you there.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  render={<a href="mailto:hello@kexalo.com" />}
                  size="lg"
                  className="group h-12 rounded-full bg-brand px-7 text-base font-semibold text-primary-foreground glow-brand transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <MailIcon />
                  hello@kexalo.com
                </Button>
                <Button
                  render={
                    <a
                      href="mailto:hello@kexalo.com?subject=Project%20inquiry%20—%20Kexalo"
                    />
                  }
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-border/80 px-7 text-base font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/60"
                >
                  Request a proposal
                  <ArrowUpRightIcon className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </div>
              <p className="mt-6 text-xs tracking-wide text-muted-foreground">
                We reply within one business day.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
