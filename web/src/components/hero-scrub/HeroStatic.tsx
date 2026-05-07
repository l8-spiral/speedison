"use client";
import { HERO } from "@/lib/content";
import { framePath } from "@/lib/frames";

export function HeroStatic() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-noir-900">
      <img
        src={framePath(1280, 227)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-noir-900/80 via-noir-900/40 to-transparent" />
      <div className="relative z-10 flex flex-col justify-center h-full pl-8 md:pl-24">
        <h1 className="text-5xl md:text-7xl text-copper-100 font-light leading-none">{HERO.taglineLine1}</h1>
        <h1 className="text-5xl md:text-7xl text-copper-300 font-light leading-none italic mt-2">{HERO.taglineLine2}</h1>
        <p className="mt-6 max-w-md text-stone-400 text-base md:text-lg">{HERO.subHeadline}</p>
      </div>
    </section>
  );
}
