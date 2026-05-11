"use client";

// Sticky "Built by SWEPROG" credit badge.
// - Fixed bottom-left, opposite the SoundToggle.
// - Compact height — single text line stacked label + name.
// - Only the "S" animates: continuous Y-axis rotation + purple pulse
//   (glow expanding and contracting). Badge stays calm.

export function SweprogBadge() {
  return (
    <a
      href="https://sweprog.se"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Built by SWEPROG"
      className="fixed bottom-6 left-6 z-50 group select-none"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-purple-500/30 bg-noir-900/80 backdrop-blur-md pl-1.5 pr-4 py-1">
        <span
          aria-hidden="true"
          className="sweprog-s relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-stone-50 font-display text-base font-semibold"
        >
          S
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[9px] tracking-[0.25em] uppercase text-stone-400">
            Built by
          </span>
          <span
            className="text-[13px] tracking-[0.15em] font-medium text-stone-100 group-hover:text-purple-300 transition-colors mt-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SWEPROG
          </span>
        </span>
      </div>

      <style jsx>{`
        :global(.sweprog-s) {
          animation:
            sweprog-spin 3.2s linear infinite,
            sweprog-pulse 1.8s ease-in-out infinite;
        }
        @keyframes sweprog-spin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes sweprog-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(168, 85, 247, 0.5),
              0 0 6px rgba(168, 85, 247, 0.3),
              0 4px 10px rgba(168, 85, 247, 0.25);
          }
          50% {
            box-shadow:
              0 0 0 2px rgba(168, 85, 247, 0.9),
              0 0 18px rgba(168, 85, 247, 0.85),
              0 4px 22px rgba(168, 85, 247, 0.7);
          }
        }
      `}</style>
    </a>
  );
}
