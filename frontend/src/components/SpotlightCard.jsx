import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

/**
 * React-bits-style "spotlight" card: a radial glow that follows the cursor,
 * masked to the card edges via CSS custom properties driven by Framer Motion
 * motion values (so the glow updates without a React re-render per pixel).
 */
export default function SpotlightCard({ children, className = '', as: Component = 'div', ...props }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, color-mix(in oklab, var(--color-brand-1) 18%, transparent), transparent 70%)`;

  const MotionComponent = motion.create ? motion.create(Component) : motion(Component);

  return (
    <MotionComponent
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl ${className}`}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </MotionComponent>
  );
}
