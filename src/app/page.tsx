import { Hero } from "@/components/hero";
import { SiteHeader } from "@/components/site-header";
import { LogoTraveller } from "@/components/logo3d-traveller";
import { TechMarquee } from "@/components/tech-marquee";
import { Services } from "@/components/services";
import { Process } from "@/components/process";
import { About } from "@/components/about";
import { Founders } from "@/components/founders";
import { Faq } from "@/components/faq";
import { Cta } from "@/components/cta";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <LogoTraveller />
      <main className="flex-1">
        <Hero />
        <TechMarquee />
        <Services />
        <Process />
        <About />
        <Founders />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
