import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Wraps children in a card that tilts in 3D toward the cursor (rotateX/Y
 * driven by pointer position) and lifts on translateZ, giving a tactile
 * "physical object" feel without any WebGL/3D asset. Springs handle the
 * settle-back so it never snaps.
 */
export default function TiltCard({ children, className = '', maxTilt = 10, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);
  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, color-mix(in oklab, white 55%, transparent), transparent 60%)`;

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div className="perspective">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`group relative ${className}`}
        {...props}
      >
        <div style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }} className="h-full">
          {children}
        </div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground, mixBlendMode: 'overlay' }}
        />
      </motion.div>
    </div>
  );
}
