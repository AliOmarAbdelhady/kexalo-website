import Image from "next/image";
import {
  BrainCircuitIcon,
  HandshakeIcon,
  ShieldCheckIcon,
  CrosshairIcon,
} from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";

const values = [
  {
    icon: CrosshairIcon,
    title: "Precision engineering",
    description:
      "Every line of code and every pixel earns its place. We ship software we're proud to sign.",
  },
  {
    icon: BrainCircuitIcon,
    title: "AI-first thinking",
    description:
      "We design products around intelligence from day one, not bolted on as an afterthought.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Security by design",
    description:
      "Hardened infrastructure, safe defaults and data handled with respect — non-negotiable.",
  },
  {
    icon: HandshakeIcon,
    title: "True partnership",
    description:
      "We work as your technical team, not a vendor. Your roadmap becomes our roadmap.",
  },
];

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy side */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Who we are"
              title={
                <>
                  A technology company,{" "}
                  <span className="text-gradient">built by builders</span>
                </>
              }
              description="Kexalo was founded by three engineers — Ali Omar, Marwan Mesbah and Youssef Ibrahim — who shared one conviction: great software comes from teams that design, build and stand behind every layer themselves."
            />
            <Reveal delay={0.22}>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                From AI systems and enterprise platforms to the phone in your
                customer&apos;s pocket, we take products from a first sketch to
                a living, evolving system — with the same three founders
                accountable from kickoff to launch day.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
                <Image
                  src="/logo-sm.png"
                  alt="Kexalo logo"
                  width={96}
                  height={38}
                  className="h-10 w-auto rounded-lg border border-border/50 bg-white p-1"
                />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Kexalo</span>{" "}
                  — technology, engineered end to end.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Values grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40">
                  <div
                    className="pointer-events-none absolute -right-10 -bottom-10 size-28 rounded-full bg-brand opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                    aria-hidden
                  />
                  <value.icon className="size-6 text-brand transition-transform duration-500 group-hover:scale-110" />
                  <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
