import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kexalo.com"),
  alternates: { canonical: "/" },
  title: {
    default: "Kexalo — AI, Web & Mobile Technology Solutions",
    template: "%s · Kexalo",
  },
  description:
    "Kexalo — technology company for AI solutions, websites, mobile applications and IT services. Founded by Ali Omar, Marwan Mesbah and Youssef Ibrahim.",
  keywords: [
    "Kexalo",
    "Kexalo AI",
    "Kexalo Solutions",
    "Kexalo company",
    "Kexalo technology",
    "Kexalo website",
    "AI solutions",
    "web development",
    "mobile applications",
    "IT solutions",
  ],
  openGraph: {
    title: "Kexalo — AI, Web & Mobile Technology Solutions",
    description:
      "We build intelligent software: AI solutions, websites, mobile apps and complete IT services.",
    url: "https://kexalo.com",
    siteName: "Kexalo Solutions",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kexalo — AI, Web & Mobile Technology Solutions",
    description:
      "We build intelligent software: AI solutions, websites, mobile apps and complete IT services.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kexalo.com/#organization",
      name: "Kexalo",
      alternateName: [
        "Kexalo Solutions",
        "Kexalo AI",
        "Kexalo Company",
        "Kexalo Technologies",
      ],
      slogan: "Technology, engineered end to end",
      url: "https://kexalo.com",
      logo: "https://kexalo.com/logo-square.png",
      description:
        "Kexalo is a technology company building AI solutions, websites, mobile applications and end-to-end IT services.",
      email: "hello@kexalo.com",
      founder: [
        { "@type": "Person", name: "Ali Omar" },
        { "@type": "Person", name: "Marwan Mesbah" },
        { "@type": "Person", name: "Youssef Ibrahim" },
      ],
      knowsAbout: [
        "Artificial intelligence solutions",
        "Website development",
        "Mobile application development",
        "IT solutions",
        "Cloud and DevOps",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://kexalo.com/#website",
      url: "https://kexalo.com",
      name: "Kexalo Solutions",
      alternateName: ["Kexalo"],
      publisher: { "@id": "https://kexalo.com/#organization" },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
