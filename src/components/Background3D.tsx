// @ts-nocheck
// Background3D.tsx — Two-layer visual background
// Receives `view` as prop (NOT from useStore) to break re-render chain
// Layer 1: Pure CSS (always renders) — Layer 2: Three.js (lazy, silent fail)
import { lazy, Suspense, Component, memo } from 'react';
import { motion } from 'framer-motion';

const Scene = lazy(() =>
  import('./ThreeScene/Scene').then(m => ({ default: m.Scene }))
);

class ThreeErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e: any) { console.warn('[THREE.js] Graceful fail:', e.message); }
  render() { return this.state.crashed ? null : this.props.children; }
}

// Deterministic constants — defined once at module scope, never re-created
const ORBS = [
  { className: 'absolute top-1/4 left-[15%] w-[600px] h-[600px] rounded-full bg-[#00ff88] blur-[240px] opacity-[0.05]', dur: 16, dx: 70, dy: -50 },
  { className: 'absolute bottom-1/4 right-[15%] w-[500px] h-[500px] rounded-full bg-[#8b5cf6] blur-[200px] opacity-[0.06]', dur: 19, dx: -60, dy: 70 },
  { className: 'absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full bg-[#0088ff] blur-[180px] opacity-[0.035]', dur: 23, dx: 50, dy: -70 },
];

const STARS = Array.from({ length: 90 }, (_, i) => ({
  left: `${(i * 1.12) % 100}%`, top: `${(i * 1.09) % 100}%`,
  w: 0.8 + (i % 3) * 0.55, dur: 2.5 + (i % 5), delay: (i * 0.09) % 4,
}));

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  emoji: ['💵', '💰', '📈', '🪙', '💎', '🚀', '📊', '⚡', '🌙', '✨'][i % 10],
  left: `${(i * 5) % 100}%`, top: `${(i * 7.3) % 100}%`,
  dur: 15 + (i % 9), delay: (i * 0.4) % 8, opacity: 0.07,
}));

interface Props { view?: string; }

// memo: this component only re-renders when `view` prop changes (on navigation)
export const Background3D = memo(function Background3D({ view = 'intro' }: Props) {
  const phase = view === 'intro' ? 'intro' : 'dashboard';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Base */}
      <div className="absolute inset-0 bg-[#020209]" />

      {/* Perspective grid */}
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage: 'linear-gradient(rgba(0,255,136,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,1) 1px,transparent 1px)',
        backgroundSize: '55px 55px',
        transform: 'perspective(700px) rotateX(52deg)',
        transformOrigin: 'center 78%',
      }} />

      {/* Glowing orbs */}
      {ORBS.map((o, i) => (
        <motion.div key={i} className={o.className}
          animate={{ scale: [1, 1.3, 1], x: [0, o.dx, 0], y: [0, o.dy, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* Stars */}
      {STARS.map((s, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white"
          style={{ left: s.left, top: s.top, width: s.w, height: s.w }}
          animate={{ opacity: [0.08, 0.65, 0.08] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }} />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div key={i} className="absolute text-xl select-none"
          style={{ left: p.left, top: p.top, opacity: p.opacity }}
          animate={{ y: [-10, 10, -10], x: [-5, 5, -5], rotate: [0, 360] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}>
          {p.emoji}
        </motion.div>
      ))}

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.01]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 4px)' }} />

      {/* Three.js — lazy loaded, silent fail */}
      <ThreeErrorBoundary>
        <Suspense fallback={null}>
          <Scene phase={phase} />
        </Suspense>
      </ThreeErrorBoundary>
    </div>
  );
});
