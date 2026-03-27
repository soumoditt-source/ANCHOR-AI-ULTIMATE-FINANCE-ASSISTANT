// @ts-nocheck
// TransitionOverlay.tsx — 3D particle burst animation between tab switches
// Renders as a fixed fullscreen overlay during the 380ms tab transition
import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// Precomputed particle positions to avoid Math.random in render
const BURST_PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const dist = 80 + (i % 4) * 60;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    scale: 0.4 + (i % 3) * 0.3,
    delay: (i % 6) * 0.02,
  };
});

const RING_SIZES = [60, 140, 240, 360];

export const TransitionOverlay = memo(function TransitionOverlay() {
  const transitioning = useStore((s) => s.transitioning);
  const activeTab = useStore((s) => s.activeTab);

  const TAB_COLORS = ['#00ff88', '#ef4444', '#22d3ee', '#a855f7'];
  const color = TAB_COLORS[activeTab] || '#00ff88';

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Radial burst from center */}
          <div className="relative">
            {/* Expanding rings */}
            {RING_SIZES.map((size, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: size, height: size,
                  left: -size / 2, top: -size / 2,
                  borderColor: color + '50',
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.38, delay: i * 0.06, ease: 'easeOut' }}
              />
            ))}

            {/* Center core flash */}
            <motion.div
              className="w-8 h-8 rounded-full"
              style={{ background: color, boxShadow: `0 0 40px 20px ${color}40` }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0] }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Particle burst */}
            {BURST_PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background: color, top: 0, left: 0 }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
                animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                transition={{ duration: 0.36, delay: p.delay, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Screen flash */}
          <motion.div
            className="absolute inset-0"
            style={{ background: color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.04, 0] }}
            transition={{ duration: 0.38 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
