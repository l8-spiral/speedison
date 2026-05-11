"use client";

// Sticky "Built by SWEPROG" credit badge.
//
// Cloned visual design from stat.gsmotors.se (the original SWEPROG mark
// the maintainer authored there). Same colour stops, same dual animation
// system (S spins continuously, a conic halo orbits it in reverse), same
// pulse keyframes, same hover acceleration. Position kept bottom-left for
// this site so it doesn't collide with the navbar logo at top-left.

export function SweprogBadge() {
  return (
    <a
      className="sweprog-tag"
      href="https://sweprog.se"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Built By SWEPROG"
    >
      <span className="sweprog-s" aria-hidden="true">S</span>
      <span>Built By SWEPROG</span>

      <style jsx>{`
        .sweprog-tag {
          position: fixed;
          bottom: 16px;
          left: 16px;
          z-index: 50;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          padding: 4px 14px 4px 5px;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.72);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition:
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.25s ease,
            border-color 0.25s ease,
            color 0.25s ease,
            box-shadow 0.3s ease;
        }
        .sweprog-tag:hover {
          transform: translateY(-2px) scale(1.03);
          background: rgba(167, 139, 250, 0.16);
          border-color: rgba(167, 139, 250, 0.45);
          color: #fff;
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.35);
        }

        .sweprog-s {
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: inline-grid;
          place-items: center;
          font-family: "JetBrains Mono", "SF Mono", monospace;
          font-weight: 800;
          font-size: 0.72rem;
          color: #fff;
          background: radial-gradient(
            circle at 30% 30%,
            #a78bfa 0%,
            #7c3aed 50%,
            #4c1d95 100%
          );
          text-shadow:
            0 0 6px rgba(196, 181, 253, 0.9),
            0 0 2px rgba(255, 255, 255, 0.4);
          animation:
            sweprog-spin 5s linear infinite,
            sweprog-pulse 2.4s ease-in-out infinite;
          flex-shrink: 0;
          isolation: isolate;
          transition: filter 0.3s ease;
        }
        .sweprog-s::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            rgba(196, 181, 253, 0) 0%,
            rgba(196, 181, 253, 0.75) 18%,
            rgba(139, 92, 246, 0) 35%,
            rgba(139, 92, 246, 0) 65%,
            rgba(196, 181, 253, 0.75) 82%,
            rgba(196, 181, 253, 0) 100%
          );
          -webkit-mask: radial-gradient(circle, transparent 56%, black 60%);
          mask: radial-gradient(circle, transparent 56%, black 60%);
          animation: sweprog-spin 3.2s linear infinite reverse;
          pointer-events: none;
          z-index: -1;
        }

        .sweprog-tag:hover .sweprog-s {
          filter: brightness(1.25) saturate(1.15);
          animation:
            sweprog-spin 1.8s linear infinite,
            sweprog-pulse 1.2s ease-in-out infinite;
        }
        .sweprog-tag:hover .sweprog-s::after {
          animation: sweprog-spin 1.5s linear infinite reverse;
        }

        @keyframes sweprog-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes sweprog-pulse {
          0%,
          100% {
            box-shadow:
              0 0 0 1px rgba(167, 139, 250, 0.55),
              0 0 8px rgba(139, 92, 246, 0.5),
              0 0 0 0 rgba(139, 92, 246, 0.5),
              inset 0 0 6px rgba(196, 181, 253, 0.35);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(167, 139, 250, 0.85),
              0 0 18px rgba(139, 92, 246, 0.85),
              0 0 0 6px rgba(139, 92, 246, 0),
              inset 0 0 9px rgba(196, 181, 253, 0.55);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sweprog-s,
          .sweprog-s::after,
          .sweprog-tag,
          .sweprog-tag:hover .sweprog-s,
          .sweprog-tag:hover .sweprog-s::after {
            animation: none !important;
            transition: none !important;
          }
          .sweprog-tag,
          .sweprog-tag:hover {
            transform: none !important;
          }
        }
      `}</style>
    </a>
  );
}
