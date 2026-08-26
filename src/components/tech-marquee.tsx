import {
 BotIcon,
  BrainIcon,
  CloudIcon,
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  GlobeIcon,
  LayersIcon,
  LockIcon,
  ServerIcon,
  SmartphoneIcon,
  TerminalIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react";

const technologies = [
  { label: "React", icon: CodeIcon },
  { label: "Next.js", icon: ZapIcon },
  { label: "TypeScript", icon: TerminalIcon },
  { label: "Python", icon: BrainIcon },
  { label: "PyTorch", icon: CpuIcon },
  { label: "LLMs & Agents", icon: BotIcon },
  { label: "React Native", icon: SmartphoneIcon },
  { label: "Flutter", icon: LayersIcon },
  { label: "Node.js", icon: WorkflowIcon },
  { label: "PostgreSQL", icon: DatabaseIcon },
  { label: "Cloudflare", icon: CloudIcon },
  { label: "AWS", icon: ServerIcon },
  { label: "Docker", icon: LockIcon },
  { label: "Web", icon: GlobeIcon },
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...technologies, ...technologies];
  return (
    <div className="mask-fade-x pause-on-hover flex overflow-hidden">
      <div
        className={
          reverse
            ? "flex shrink-0 items-center gap-3 pr-3 animate-marquee-reverse"
            : "flex shrink-0 items-center gap-3 pr-3 animate-marquee"
        }
      >
        {items.map((tech, i) => (
          <span
            key={`${tech.label}-${i}`}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur transition-colors duration-300 hover:border-brand/50 hover:text-foreground"
          >
            <tech.icon className="size-3.5 text-brand" />
            {tech.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechMarquee() {
  return (
    <section aria-label="Technologies we use" className="relative py-10">
      <div className="flex flex-col gap-3">
        <MarqueeRow />
        <div className="hidden sm:block">
          <MarqueeRow reverse />
        </div>
      </div>
    </section>
  );
}
