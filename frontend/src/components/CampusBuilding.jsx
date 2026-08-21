import { motion } from 'framer-motion';

/**
 * A hand-drawn isometric-style campus hall (pediment, columns, steps) used
 * as the hero's centerpiece "3D object" -- built entirely from SVG shapes
 * plus a CSS perspective tilt, so it needs no external 3D model/asset file
 * and stays crisp at any size.
 */
export default function CampusBuilding({ className = '' }) {
  return (
    <div className={`perspective ${className}`} aria-hidden>
      <motion.div
        className="animate-float"
        style={{ animationDuration: '7s' }}
        initial={{ opacity: 0, scale: 0.9, rotateY: -8 }}
        animate={{ opacity: 1, scale: 1, rotateY: -8 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 420 340"
          className="h-full w-full drop-shadow-2xl"
          style={{ transform: 'rotateX(10deg) rotateY(-8deg)', transformStyle: 'preserve-3d' }}
        >
          <defs>
            <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-2)" />
              <stop offset="100%" stopColor="var(--color-brand-1)" />
            </linearGradient>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffdf8" />
              <stop offset="100%" stopColor="#f1ece0" />
            </linearGradient>
            <linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e4dcc9" />
              <stop offset="100%" stopColor="#cfc4a8" />
            </linearGradient>
            <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-3)" />
              <stop offset="100%" stopColor="#3f5a45" />
            </linearGradient>
          </defs>

          {/* ground shadow */}
          <ellipse cx="210" cy="322" rx="150" ry="14" fill="var(--color-ink)" opacity="0.08" />

          {/* base steps */}
          <rect x="40" y="290" width="340" height="14" rx="3" fill="url(#sideGrad)" />
          <rect x="55" y="276" width="310" height="14" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />

          {/* main hall body */}
          <rect x="70" y="150" width="280" height="126" fill="url(#bodyGrad)" stroke="var(--color-border)" strokeWidth="1.5" />
          {/* right-face shading for depth */}
          <polygon points="350,150 372,138 372,264 350,276" fill="url(#sideGrad)" />

          {/* columns */}
          {[95, 140, 185, 230, 275, 320].map((x) => (
            <rect key={x} x={x} y="160" width="14" height="110" rx="2" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          ))}

          {/* entablature under pediment */}
          <rect x="62" y="140" width="296" height="14" fill="url(#roofGrad)" />
          <polygon points="358,140 380,128 380,142 358,154" fill="var(--color-brand-2)" />

          {/* pediment (triangular roof) */}
          <polygon points="210,60 380,128 40,128" fill="url(#roofGrad)" />
          <polygon points="210,60 380,128 402,120 210,48" fill="var(--color-brand-2)" opacity="0.9" />

          {/* cupola / dome on top */}
          <rect x="192" y="30" width="36" height="26" fill="url(#bodyGrad)" stroke="var(--color-border)" strokeWidth="1" />
          <path d="M188 30 Q210 -6 232 30 Z" fill="url(#domeGrad)" />
          <rect x="207" y="-10" width="6" height="16" fill="var(--color-brand-3)" />
          <circle cx="210" cy="-12" r="4" fill="var(--color-brand-1)" />

          {/* door */}
          <rect x="192" y="220" width="36" height="56" rx="4" fill="var(--color-brand-2)" opacity="0.9" />

          {/* windows */}
          {[102, 250].map((x) => (
            <g key={x}>
              <rect x={x} y="190" width="20" height="26" rx="2" fill="var(--color-brand-3)" opacity="0.35" />
              <rect x={x + 28} y="190" width="20" height="26" rx="2" fill="var(--color-brand-3)" opacity="0.35" />
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
