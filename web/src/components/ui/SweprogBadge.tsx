"use client";
import { useRef, useState } from "react";

// Sticky "Built by SWEPROG" credit badge.
// - Fixed bottom-left, away from the SoundToggle (bottom-right).
// - The "S" spins continuously on Y axis (3D rotation, not 2D — there's a
//   subtle perspective so the letter has thickness).
// - On hover, the whole badge tilts to follow the cursor (perspective +
//   mouse-tracked rotateX/Y), giving the "alive" feel.
// - Purple accent (#a855f7) on the S itself and the hover glow, matching
//   SWEPROG's brand mark.

export function SweprogBadge() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, hover: false });

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: y * -18, ry: x * 22, hover: true });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, hover: false });
  }

  return (
    <a
      ref={ref}
      href="https://sweprog.se"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Built by SWEPROG"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="fixed bottom-6 left-6 z-50 group select-none"
      style={{
        perspective: "600px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="flex items-center gap-3 rounded-full border border-purple-500/30 bg-noir-900/80 backdrop-blur-md pl-2 pr-5 py-2 transition-all duration-300"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          boxShadow: tilt.hover
            ? "0 0 32px rgba(168, 85, 247, 0.45), 0 0 8px rgba(168, 85, 247, 0.6) inset"
            : "0 0 12px rgba(168, 85, 247, 0.15)",
        }}
      >
        <span
          aria-hidden="true"
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-stone-50 font-display text-lg font-semibold"
          style={{
            animation: "sweprog-spin 3.2s linear infinite",
            transformStyle: "preserve-3d",
            boxShadow:
              "0 0 0 1px rgba(168, 85, 247, 0.5), 0 4px 12px rgba(168, 85, 247, 0.35)",
          }}
        >
          S
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] tracking-[0.25em] uppercase text-stone-400">
            Built by
          </span>
          <span
            className="text-sm tracking-[0.15em] font-medium text-stone-100 group-hover:text-purple-300 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SWEPROG
          </span>
        </span>
      </div>

      <style jsx>{`
        @keyframes sweprog-spin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </a>
  );
}
