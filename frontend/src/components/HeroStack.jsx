import { motion } from 'framer-motion';

/**
 * A layered stack of 3D-tilted "mock idea cards" used as the hero's visual
 * centerpiece -- built entirely from CSS perspective/rotate/translateZ, no
 * external 3D asset or image required.
 *
 * Each card anchors at the container's center (top/left: 50%, via plain
 * style, not a transform) and framer-motion's x/y then offsets it in real
 * pixels. Framer's x/y only animate plain numbers -- a calc() string is not
 * interpolated and silently collapses every card to the same spot, which is
 * why the offsets are pre-computed here instead of expressed as CSS calc().
 */
const CARD_W = 256; // matches the w-64 class below
const CARD_H = 124; // approx rendered height

const CARDS = [
  {
    domain: 'Sustainability',
    domainClass: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
    title: 'Solar Charging Benches',
    votes: 42,
    status: 'Prototype',
    statusClass: 'bg-fuchsia-100 text-fuchsia-800',
    rotate: { x: 8, y: -14, z: -10 },
    offset: { x: -170, y: -70, z: 0 },
    delay: 0,
  },
  {
    domain: 'Technology',
    domainClass: 'bg-cyan-100 text-cyan-800 ring-cyan-300',
    title: 'AI Timetable Optimizer',
    votes: 87,
    status: 'Implemented',
    statusClass: 'bg-emerald-100 text-emerald-800',
    rotate: { x: 4, y: 8, z: 8 },
    offset: { x: 140, y: -130, z: 60 },
    delay: 0.8,
  },
  {
    domain: 'Safety',
    domainClass: 'bg-red-100 text-red-800 ring-red-300',
    title: 'Night Escort App',
    votes: 63,
    status: 'Under Review',
    statusClass: 'bg-amber-100 text-amber-800',
    rotate: { x: -6, y: -6, z: -4 },
    offset: { x: 20, y: 130, z: 30 },
    delay: 1.6,
  },
];

export default function HeroStack() {
  return (
    <div className="perspective relative mx-auto h-[26rem] w-full max-w-md" aria-hidden>
      {CARDS.map((card, i) => (
        // Positioning (framer x/y) and the CSS float bob both animate
        // `transform` -- putting them on the same element lets the CSS
        // @keyframes win the cascade and erase framer's offset every frame.
        // So the outer div owns position only; the inner div owns the bob.
        <motion.div
          key={card.title}
          className="absolute w-64"
          style={{ top: '50%', left: '50%', transformStyle: 'preserve-3d' }}
          initial={{ opacity: 0, scale: 0.85, x: card.offset.x - CARD_W / 2, y: card.offset.y - CARD_H / 2 }}
          animate={{ opacity: 1, scale: 1, x: card.offset.x - CARD_W / 2, y: card.offset.y - CARD_H / 2 }}
          transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 120, damping: 16 }}
        >
          <div className="animate-float" style={{ animationDelay: `${card.delay}s` }}>
            <div
              className="glass rounded-2xl p-4 shadow-2xl shadow-[var(--color-ink)]/10"
              style={{
                transform: `rotateX(${card.rotate.x}deg) rotateY(${card.rotate.y}deg) rotateZ(${card.rotate.z}deg) translateZ(${card.rotate.z}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${card.domainClass}`}>
                {card.domain}
              </span>
              <p className="font-display mt-2.5 text-sm font-semibold text-[var(--color-ink)]">{card.title}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${card.statusClass}`}>{card.status}</span>
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-2.5 py-1 text-[11px] font-bold text-white">
                  ▲ {card.votes}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
