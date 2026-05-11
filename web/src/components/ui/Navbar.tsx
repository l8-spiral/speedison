"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/content";

export function Navbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        solid ? "bg-noir-900/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link href="/" aria-label={COMPANY.name}>
          <Image src="/brand/logo.png" alt={COMPANY.name} width={160} height={36} priority />
        </Link>
        <ul className="hidden md:flex gap-8 text-sm tracking-[0.2em] uppercase text-stone-300">
          <li><a href="#tjanster" className="hover:text-copper-300">Tjänster</a></li>
          <li><a href="#konfigurator" className="hover:text-copper-300">Offert</a></li>
          <li><Link href="/kontakt" className="hover:text-copper-300">Kontakt</Link></li>
        </ul>
        <a
          href="#konfigurator"
          className="px-5 py-2 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition text-sm tracking-[0.2em] uppercase"
        >
          Konfigurera
        </a>
      </nav>
    </header>
  );
}
