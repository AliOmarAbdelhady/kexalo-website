"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  ArrowUpRightIcon,
  BotIcon,
  BrainIcon,
  CloudCogIcon,
  EyeIcon,
  GlobeIcon,
  LineChartIcon,
  MessagesSquareIcon,
  ServerCogIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  WorkflowIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal, SectionHeading } from "@/components/reveal";
import { cn } from "@/lib/utils";

function CardShell({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-colors duration-300 hover:border-brand/40 sm:p-7",
        className
      )}
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[130%] -translate-x-1/2 rounded-full bg-brand opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20"
        aria-hidden
      />
      {children}
    </motion.div>
  );
}

function ServiceIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110",
        className
      )}
    >
      <Icon className="size-6" />
    </div>
  );
}

const aiFeatures = [
  { icon: BotIcon, label: "AI agents & assistants" },
  { icon: BrainIcon, label: "LLM-powered products" },
  { icon: EyeIcon, label: "Computer vision" },
  { icon: LineChartIcon, label: "Predictive analytics" },
  { icon: WorkflowIcon, label: "Intelligent automation" },
  { icon: MessagesSquareIcon, label: "Conversational AI" },
];

export function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Everything digital,{" "}
              <span className="text-gradient">engineered end to end</span>
            </>
          }
          description="From a machine-learning core to the app in your customers' hands — we cover the full spectrum of modern software."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {/* AI — hero card */}
          <CardShell className="md:col-span-4" delay={0}>
            <div className="flex items-start justify-between gap-4">
              <ServiceIcon icon={BrainIcon} />
              <Badge
                variant="outline"
                className="rounded-full border-brand/40 bg-brand/10 text-brand"
              >
                Flagship
              </Badge>
            </div>
            <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
              AI Solutions
            </h3>
            <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              We put artificial intelligence to work inside your business —
              custom models, LLM applications, agents and automations that
              think, decide and act.
            </p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {aiFeatures.map((f, i) => (
                <span
                  key={f.label}
                  className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/40 px-3.5 py-2.5 text-sm text-muted-foreground transition-all duration-300 hover:border-brand/40 hover:text-foreground"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  <f.icon className="size-4 shrink-0 text-brand" />
                  {f.label}
                </span>
              ))}
            </div>
          </CardShell>

          {/* Web */}
          <CardShell className="md:col-span-2" delay={0.1}>
            <ServiceIcon icon={GlobeIcon} />
            <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight">
              Website Development
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              Blazing-fast marketing sites, platforms, e-commerce and SaaS
              products built on modern web technology.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Next.js", "E-commerce", "SaaS", "SEO-ready"].map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="rounded-full font-normal"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </CardShell>

          {/* Mobile */}
          <CardShell className="md:col-span-2" delay={0.15}>
            <ServiceIcon icon={SmartphoneIcon} />
            <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight">
              Mobile Applications
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              Native-quality iOS & Android apps from a single codebase —
              designed, built and shipped to the stores.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["iOS", "Android", "React Native", "Flutter"].map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="rounded-full font-normal"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </CardShell>

          {/* IT Solutions — wide */}
          <CardShell className="md:col-span-4" delay={0.2}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex-1">
                <ServiceIcon icon={ServerCogIcon} />
                <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
                  IT Solutions
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  The complete back-office of your digital business —
                  infrastructure, cloud, security and the people who keep it
                  all running.
                </p>
              </div>
              <div className="grid flex-1 gap-2.5 sm:grid-cols-2">
                {[
                  { icon: CloudCogIcon, label: "Cloud & DevOps" },
                  { icon: ShieldCheckIcon, label: "Cybersecurity" },
                  { icon: WorkflowIcon, label: "Digital transformation" },
                  { icon: ServerCogIcon, label: "Managed IT support" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/40 px-3.5 py-2.5 text-sm text-muted-foreground transition-colors duration-300 hover:border-brand/40 hover:text-foreground"
                  >
                    <f.icon className="size-4 shrink-0 text-brand" />
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          </CardShell>

          {/* Slim banner */}
          <Reveal
            delay={0.1}
            className="md:col-span-6"
          >
            <div className="group relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl border border-brand/25 bg-gradient-to-r from-brand/10 via-transparent to-brand/10 p-6 sm:flex-row sm:items-center sm:p-7">
              <div className="flex items-center gap-4">
                <ServiceIcon icon={ZapIcon} className="size-11" />
                <div>
                  <h4 className="font-heading text-lg font-semibold tracking-tight">
                    …and everything in between
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    UI/UX design, branding, integrations, maintenance and
                    long-term evolution of your product.
                  </p>
                </div>
              </div>
              <a
                href="#contact"
                className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-foreground"
              >
                Discuss your project
                <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
