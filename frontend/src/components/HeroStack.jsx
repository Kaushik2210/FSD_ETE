import { motion } from 'framer-motion';

/**
 * A layered stack of 3D-tilted "mock idea cards" used as the hero's visual
 * centerpiece -- built entirely from CSS perspective/rotate/translateZ, no
 * external 3D asset or image required.
 */
const CARDS = [
  {
    domain: 'Sustainability',
    domainClass: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
    title: 'Solar Charging Benches',
    votes: 42,
    status: 'Prototype',
    statusClass: 'bg-fuchsia-100 text-fuchsia-800',
    rotate: { x: 8, y: -14, z: -6 },
    translate: { x: -30, y: 10, z: 0 },
    delay: 0,
  },
  {
    domain: 'Technology',
    domainClass: 'bg-cyan-100 text-cyan-800 ring-cyan-300',
    title: 'AI Timetable Optimizer',
    votes: 87,
    status: 'Implemented',
    statusClass: 'bg-emerald-100 text-emerald-800',
    rotate: { x: 4, y: 6, z: 4 },
    translate: { x: 40, y: -60, z: 60 },
    delay: 0.8,
  },
  {
    domain: 'Safety',
    domainClass: 'bg-red-100 text-red-800 ring-red-300',
    title: 'Night Escort App',
    votes: 63,
    status: 'Under Review',
    statusClass: 'bg-amber-100 text-amber-800',
    rotate: { x: -6, y: -4, z: -3 },
    translate: { x: 10, y: 90, z: 30 },
    delay: 1.6,
  },
];

export default function HeroStack() {
  return (
    <div className="perspective relative mx-auto h-[26rem] w-full max-w-md" aria-hidden>
      {CARDS.map((card, i) => (
        <motion.div
          key={card.title}
          className="animate-float absolute left-1/2 top-1/2 w-64"
          style={{
            animationDelay: `${card.delay}s`,
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: `calc(-50% + ${card.translate.x}px)`,
            y: `calc(-50% + ${card.translate.y}px)`,
          }}
          transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 120, damping: 16 }}
        >
          <div
            className="glass rounded-2xl p-4 shadow-2xl shadow-[var(--color-ink)]/10"
            style={{
              transform: `rotateX(${card.rotate.x}deg) rotateY(${card.rotate.y}deg) rotateZ(${card.rotate.z}deg) translateZ(${card.translate.z}px)`,
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
        </motion.div>
      ))}
    </div>
  );
}
