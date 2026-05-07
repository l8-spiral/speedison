"use client";
import { useEffect, useState } from "react";
import { setMuted, getInitialMuted } from "@/lib/audio";

export function SoundToggle() {
  const [muted, setLocal] = useState(true);

  useEffect(() => {
    const initial = getInitialMuted();
    setLocal(initial);
    setMuted(initial);
  }, []);

  function toggle() {
    const next = !muted;
    setLocal(next);
    setMuted(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Aktivera ljud" : "Stäng av ljud"}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border border-copper-300 bg-noir-900/80 backdrop-blur text-copper-300 flex items-center justify-center hover:bg-copper-300 hover:text-noir-900 transition"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
