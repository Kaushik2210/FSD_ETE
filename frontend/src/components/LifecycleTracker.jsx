import { motion } from 'framer-motion';
import { STATUSES, STATUS_STYLES } from '../utils/constants.js';

/** Horizontal step tracker showing where an idea sits in Submitted -> ... -> Implemented. */
export default function LifecycleTracker({ status }) {
  const currentIndex = STATUSES.indexOf(status);

  return (
    <div className="flex items-center">
      {STATUSES.map((stage, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        const style = STATUS_STYLES[stage];

        return (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.15 : 1 }}
                className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ring-2 ${
                  done || active
                    ? `${style.bg} ${style.text} ${style.ring}`
                    : 'bg-[var(--color-surface-hi)] text-[var(--color-ink-faint)] ring-[var(--color-border)]'
                }`}
              >
                {done ? '✓' : idx + 1}
              </motion.div>
              <span className={`hidden text-center text-[10px] leading-tight sm:block ${active ? style.text : 'text-[var(--color-ink-faint)]'}`} style={{ maxWidth: '5.5rem' }}>
                {stage}
              </span>
            </div>
            {idx < STATUSES.length - 1 && (
              <div className="mx-1 h-0.5 flex-1 rounded-full bg-[var(--color-border)] sm:mx-2">
                <motion.div
                  initial={false}
                  animate={{ width: done ? '100%' : '0%' }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-3)]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
