import Image from "next/image";
import { MailIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const serviceLinks = [
  { label: "AI Solutions", href: "#services" },
  { label: "Website Development", href: "#services" },
  { label: "Mobile Applications", href: "#services" },
  { label: "IT Solutions", href: "#services" },
];

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Our process", href: "#process" },
  { label: "Founders", href: "#founders" },
  { label: "FAQ", href: "#faq" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-sm.png"
                alt="Kexalo logo"
                width={110}
                height={44}
                className="h-9 w-auto rounded-lg border border-border/50 bg-white object-contain p-1"
              />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A technology company building AI solutions, websites, mobile
              applications and end-to-end IT services. Founded by Ali Omar,
              Marwan Mesbah and Youssef Ibrahim.
            </p>
            <a
              href="mailto:hello@kexalo.com"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-foreground"
            >
              <MailIcon className="size-4" />
              hello@kexalo.com
            </a>
          </div>

          {/* Services */}
          <nav className="md:col-span-2" aria-label="Services">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-foreground/80 uppercase">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav className="md:col-span-2" aria-label="Company">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-foreground/80 uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tagline block */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-foreground/80 uppercase">
              Kexalo Solutions
            </h3>
            <p className="mt-4 font-heading text-lg leading-snug font-medium tracking-tight">
              Technology,{" "}
              <span className="text-gradient">engineered end to end.</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              One team for AI, web, mobile and IT — from first sketch to
              scale.
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-border/60" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} Kexalo. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand animate-pulse-soft" />
            Built with Next.js · Running on Cloudflare
          </p>
        </div>
      </div>
    </footer>
  );
}
