import React from 'react';

interface NexusLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const NexusLogo: React.FC<NexusLogoProps> = ({
  className = '',
  size = 36,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Glow Filter SVG Definition */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="nexus-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="nexus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Neon Glowing Circle */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#ring-grad)"
            strokeWidth="3.5"
            className="opacity-90"
            filter="url(#nexus-glow)"
          />

          {/* Inner Geometrical Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#a855f7"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            className="opacity-60"
          />

          {/* Connected Network Lattice Lines */}
          <g stroke="url(#nexus-grad)" strokeWidth="1.5" className="opacity-80">
            <line x1="50" y1="12" x2="30" y2="28" />
            <line x1="50" y1="12" x2="70" y2="28" />
            <line x1="30" y1="28" x2="20" y2="50" />
            <line x1="70" y1="28" x2="80" y2="50" />
            <line x1="20" y1="50" x2="30" y2="72" />
            <line x1="80" y1="50" x2="70" y2="72" />
            <line x1="30" y1="72" x2="50" y2="88" />
            <line x1="70" y1="72" x2="50" y2="88" />

            <line x1="50" y1="12" x2="50" y2="34" />
            <line x1="50" y1="88" x2="50" y2="66" />

            <line x1="30" y1="28" x2="50" y2="34" />
            <line x1="70" y1="28" x2="50" y2="34" />
            <line x1="30" y1="72" x2="50" y2="66" />
            <line x1="70" y1="72" x2="50" y2="66" />
          </g>

          {/* Center Stylized "N" Neural Path */}
          <path
            d="M 36 64 V 36 L 64 64 V 36"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#nexus-glow)"
          />
          <path
            d="M 36 64 V 36 L 64 64 V 36"
            stroke="url(#ring-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Network Connection Nodes (Dots) */}
          <g fill="#e9d5ff">
            <circle cx="50" cy="12" r="3.5" />
            <circle cx="30" cy="28" r="3.5" />
            <circle cx="70" cy="28" r="3.5" />
            <circle cx="20" cy="50" r="3.5" />
            <circle cx="80" cy="50" r="3.5" />
            <circle cx="30" cy="72" r="3.5" />
            <circle cx="70" cy="72" r="3.5" />
            <circle cx="50" cy="88" r="3.5" />
            <circle cx="50" cy="34" r="3" fill="#a855f7" />
            <circle cx="50" cy="66" r="3" fill="#a855f7" />
          </g>
        </svg>
      </div>

      {showText && (
        <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
          Nexus AI
        </span>
      )}
    </div>
  );
};
