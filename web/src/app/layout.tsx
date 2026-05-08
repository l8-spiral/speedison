import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/lenis/SmoothScroll";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SoundToggle } from "@/components/ui/SoundToggle";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display",
  fallback: ["Georgia", "serif"],
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://speedison.se"),
  title: "Speedison — Performance reimagined",
  description:
    "Optimering, Stage 1 & 2, Pops & Bangs, avgassystem för högpresterande bilar i Kungsängen.",
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Speedison",
    title: "Speedison — Performance reimagined",
    description:
      "Optimering, Stage 1 & 2, Pops & Bangs, avgassystem för högpresterande bilar i Kungsängen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Speedison — Performance reimagined",
    description:
      "Optimering, Stage 1 & 2, Pops & Bangs, avgassystem för högpresterande bilar i Kungsängen.",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "Speedison",
  image: "https://speedison.se/brand/logo.png",
  telephone: "+4683333346",
  email: "info@speedison.se",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Mätarvägen 9A",
    postalCode: "19637",
    addressLocality: "Kungsängen",
    addressCountry: "SE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "12:00",
      closes: "16:00",
    },
  ],
  url: "https://speedison.se",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Navbar />
        <SoundToggle />
        <SmoothScroll>
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
