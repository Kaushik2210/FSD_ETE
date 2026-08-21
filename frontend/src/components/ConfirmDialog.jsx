import { AnimatePresence, motion } from 'framer-motion';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-dim)]">{message}</p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)] transition-colors hover:text-[var(--color-ink)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
                  danger ? 'bg-rose-500' : 'bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)]'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
