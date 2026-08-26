"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "@/components/reveal";

const faqs = [
  {
    question: "What is Kexalo?",
    answer:
      "Kexalo — also known as Kexalo Solutions — is a technology company founded by Ali Omar, Marwan Mesbah and Youssef Ibrahim. We specialize in AI solutions, website development, mobile applications and complete IT solutions for startups and established businesses worldwide.",
  },
  {
    question: "What does Kexalo actually build?",
    answer:
      "Anything software: AI-powered products and automations, company websites and web platforms, iOS & Android mobile apps, and the surrounding IT infrastructure — cloud, security, integrations and support. If it runs on a screen, we can build it.",
  },
  {
    question: "How does a project with you start?",
    answer:
      "With a conversation. Tell us about your idea or problem — we'll come back with a clear proposal: scope, timeline, technology choices and a fixed budget. No commitment needed before that.",
  },
  {
    question: "Do you work with startups as well as established companies?",
    answer:
      "Both. For startups we move fast and build the smallest product that proves the idea; for established businesses we integrate with existing systems and teams. The engineering bar stays the same.",
  },
  {
    question: "Who will actually work on my project?",
    answer:
      "The founders — Ali Omar, Marwan Mesbah and Youssef Ibrahim — lead every engagement directly, supported by our in-house team. You'll never be handed off to a distant delivery center.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We stay with you: monitoring, maintenance, new features and scaling as you grow. Most of our clients keep us on as their long-term technology partner.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions, <span className="text-gradient">answered</span>
            </>
          }
        />
        <Reveal delay={0.15} className="mt-12">
          <Accordion
            defaultValue={[0]}
            className="rounded-3xl border border-border/60 bg-card/60 px-6 backdrop-blur sm:px-8"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={[i]}
                className="border-border/50 last:border-b-0"
              >
                <AccordionTrigger className="py-5 text-base font-medium hover:no-underline sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
