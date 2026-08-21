import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: '✓', ring: 'ring-emerald-400/40', dot: 'bg-emerald-400' },
  error: { icon: '!', ring: 'ring-rose-400/40', dot: 'bg-rose-400' },
  info: { icon: 'i', ring: 'ring-cyan-400/40', dot: 'bg-cyan-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'info', duration = 3500) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const v = VARIANTS[t.variant] ?? VARIANTS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`glass pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-2xl ring-1 ${v.ring} max-w-sm`}
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${v.dot} text-xs font-bold text-black/80`}>
                  {v.icon}
                </span>
                <p className="text-sm text-[var(--color-ink)]">{t.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
