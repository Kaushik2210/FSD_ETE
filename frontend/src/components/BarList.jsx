import { motion } from 'framer-motion';

/** Lightweight horizontal bar chart -- no charting library needed for this scale of data. */
export default function BarList({ items, colorClass = 'bg-[var(--color-brand-1)]' }) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--color-ink-dim)]">{item.key}</span>
            <span className="text-[var(--color-ink-faint)]">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-hi)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={`h-full rounded-full ${colorClass}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
