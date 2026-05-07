import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speedison — Performance reimagined",
  description: "Optimering, Stage 1 & 2, Pops & Bangs, avgassystem för högpresterande bilar i Kungsängen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="antialiased bg-black text-stone-100">{children}</body>
    </html>
  );
}
