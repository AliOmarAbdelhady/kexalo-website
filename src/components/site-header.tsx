"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRightIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Founders", href: "#founders" },
  { label: "FAQ", href: "#faq" },
];

function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center p-1", className)}>
      {/* dark mode: white + mint artwork over the dark navbar */}
      <Image
        src="/logo-nav-dark.png"
        alt="Kexalo logo"
        width={480}
        height={112}
        className="hidden h-8 w-auto dark:block"
        priority
      />
      {/* light mode: dark ink artwork over the light navbar */}
      <Image
        src="/logo-nav-light.png"
        alt="Kexalo logo"
        width={480}
        height={112}
        className="h-8 w-auto dark:hidden"
        priority
      />
    </span>
  );
}

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6",
          scrolled &&
            "mt-3 max-w-5xl rounded-2xl border border-border/60 glass shadow-lg shadow-black/5"
        )}
      >
        <a href="#top" aria-label="Kexalo — back to top" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-brand to-brand-2 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            render={<a href="#contact" />}
            size="sm"
            className="group hidden rounded-full bg-brand px-4 font-semibold text-primary-foreground glow-brand transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Start a project
            <ArrowUpRightIcon className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 gap-0 p-0">
              <SheetHeader className="border-b border-border/60 p-4">
                <SheetTitle className="flex items-center">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link, i) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <a
                        href={link.href}
                        className="rounded-xl px-4 py-3 font-heading text-lg font-medium transition-colors hover:bg-muted"
                      />
                    }
                  >
                    <span className="mr-3 font-mono text-xs text-brand">
                      0{i + 1}
                    </span>
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <Button
                  render={<a href="#contact" />}
                  className="w-full rounded-full bg-brand font-semibold text-primary-foreground glow-brand"
                >
                  Start a project
                  <ArrowUpRightIcon />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
