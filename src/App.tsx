// @ts-nocheck
// App.tsx — Full-screen panel system + physics-based scroll-driven 3D video scrub
// Scroll DOWN → video plays forward (move into 3D space)
// Scroll UP   → video plays backward (retreat)
// RAF loop with friction decay gives physical, elastic feel

import React, { lazy, Suspense, Component, useState, useRef, useEffect, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { LoadingScreen } from './components/LoadingScreen';
import { SideNav } from './components/SideNav';
import { FloatingAndy } from './components/FloatingAndy';
import { StatsTicker } from './components/StatsTicker';
import { TransitionOverlay } from './components/TransitionOverlay';

const Background3D = lazy(() =>
  import('./components/Background3D').then(m => ({ default: m.Background3D }))
);

const PageHome      = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const PageConcierge = lazy(() => import('./pages/Concierge').then(m => ({ default: m.Concierge })));
const PageWarRoom   = lazy(() => import('./pages/WarRoom').then(m => ({ default: m.WarRoom })));
const PageInfinity  = lazy(() => import('./pages/Infinity').then(m => ({ default: m.Infinity })));
const PageMarket    = lazy(() => import('./pages/Market').then(m => ({ default: m.Market })));
const PagePlanner   = lazy(() => import('./pages/Planner').then(m => ({ default: m.Planner })));
const PageServices  = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const PageKPIs      = lazy(() => import('./pages/KPIs').then(m => ({ default: m.KPIs })));
const PageHistory   = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const PageAndy      = lazy(() => import('./pages/Andy').then(m => ({ default: m.Andy })));
const Onboarding    = lazy(() => import('./components/Onboarding').then(m => ({ default: m.Onboarding })));
const Intro         = lazy(() => import('./components/Intro').then(m => ({ default: m.Intro })));

class AppErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e: any) { console.error('[AnchorAI]', e); }
  render() {
    if (this.state.crashed) return (
      <div className="min-h-screen bg-[#020209] flex items-center justify-center flex-col gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center text-2xl">⚓</div>
        <p className="text-white font-black text-xl">ANCHOR AI</p>
        <p className="text-white/40 text-sm">A component crashed.</p>
        <button onClick={() => this.setState({ crashed: false })}
          className="px-6 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold">Retry</button>
      </div>
    );
    return this.props.children;
  }
}

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#0088ff] animate-pulse" />
          <div className="w-32 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-[#00ff88] to-[#0088ff]"
              animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.2, repeat: Infinity }} />
          </div>
        </div>
      </div>
    }>{children}</Suspense>
  );
}

// ─────────────────────────────────────────────────────────────
// Physics-based scroll-scrub hook
// Accumulates scroll velocity, applies friction each RAF frame,
// drives video currentTime forward/backward accordingly
// ─────────────────────────────────────────────────────────────
function useScrollScrub(
  videoRef: React.RefObject<HTMLVideoElement>,
  containerRef?: React.RefObject<HTMLElement>,
  scrubSpeed = 0.006,
  friction = 0.88
) {
  const velocityRef = useRef(0);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef(0);
  const scaleRef = useRef(1);

  const rafLoop = useCallback((timestamp: number) => {
    const dt = timestamp - (prevTimeRef.current || timestamp);
    prevTimeRef.current = timestamp;

    const v = velocityRef.current;
    if (Math.abs(v) > 0.0001) {
      const el = videoRef.current;
      if (el && el.duration) {
        const delta = v * scrubSpeed * (dt / 16); // normalize to 60fps
        el.currentTime = Math.max(0, Math.min(el.duration - 0.02, el.currentTime + delta));
      }
      velocityRef.current *= friction;
    }
    rafRef.current = requestAnimationFrame(rafLoop);
  }, [videoRef, scrubSpeed, friction]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(rafLoop);

    const addVelocity = (dy: number) => { velocityRef.current += dy; };

    // Wheel — works on desktop
    const onWheel = (e: WheelEvent) => addVelocity(e.deltaY);

    // Touch — works on mobile
    let lastY = 0;
    const onTouchStart = (e: TouchEvent) => { lastY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      addVelocity((lastY - e.touches[0].clientY) * 2);
      lastY = e.touches[0].clientY;
    };

    // Listen on container if provided, otherwise window
    const target = containerRef?.current ?? window;
    target.addEventListener('wheel', onWheel as any, { passive: true });
    target.addEventListener('touchstart', onTouchStart as any, { passive: true });
    target.addEventListener('touchmove', onTouchMove as any, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      target.removeEventListener('wheel', onWheel as any);
      target.removeEventListener('touchstart', onTouchStart as any);
      target.removeEventListener('touchmove', onTouchMove as any);
    };
  }, [rafLoop, containerRef]);
}

// ─────────────────────────────────────────────────────────────
// AmbientVideo — blurred, tinted 3D background for dashboard
// Two video layers at different blur/opacity for parallax depth
// Scroll velocity drives their currentTime in opposite fractions
// (primary scrubs fast, secondary scrubs slow → 3D parallax)
// ─────────────────────────────────────────────────────────────
const AmbientVideo = memo(function AmbientVideo({ pageIdx, totalPages }: { pageIdx: number; totalPages: number }) {
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Start both videos
  useEffect(() => {
    [primaryRef, secondaryRef].forEach(r => {
      const v = r.current;
      if (!v) return;
      v.muted = true; v.playsInline = true; v.loop = true;
      v.play().catch(() => {});
    });
  }, []);

  // Playback rate nudges based on page position (slow early, faster toward end)
  useEffect(() => {
    const rate = 0.3 + (pageIdx / Math.max(1, totalPages - 1)) * 0.9;
    [primaryRef, secondaryRef].forEach(r => {
      if (r.current) r.current.playbackRate = rate;
    });
  }, [pageIdx, totalPages]);

  // RAF physics scrub for primary video driven by page panel scroll
  // (secondary just loops — acts as ambient)
  useScrollScrub(primaryRef, undefined, 0.004, 0.86);

  // Extra: listen on inner page scroller too
  useEffect(() => {
    const panel = document.getElementById('page-content-panel');
    if (!panel) return;
    let lastScroll = 0;
    const onScroll = () => {
      const delta = panel.scrollTop - lastScroll;
      lastScroll = panel.scrollTop;
      const v = primaryRef.current;
      if (v && v.duration) {
        v.currentTime = Math.max(0, Math.min(v.duration - 0.02, v.currentTime + delta * 0.003));
      }
    };
    panel.addEventListener('scroll', onScroll, { passive: true });
    return () => panel.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* PRIMARY: faster scrub, moderate blur, clear enough to show motion */}
      <div
        ref={wrapperRef}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <video
          ref={primaryRef}
          src="/bg-video-2.mp4"
          className="absolute inset-0 w-full h-full object-cover object-center"
          muted playsInline loop autoPlay preload="auto"
          style={{
            filter: 'blur(36px) saturate(1.5) brightness(0.85)',
            transform: 'scale(1.1)',
            opacity: 0.20,
          }}
        />

        {/* SECONDARY: deeper blur, slight screen blend — adds chromatic depth */}
        <video
          ref={secondaryRef}
          src="/bg-video-1.mp4"
          className="absolute inset-0 w-full h-full object-cover object-center"
          muted playsInline loop autoPlay preload="auto"
          style={{
            filter: 'blur(64px) saturate(1.8) brightness(0.7)',
            transform: 'scale(1.2)',
            opacity: 0.09,
            mixBlendMode: 'screen',
          }}
        />

        {/* ── OVERLAYS ── */}
        {/* Main dark tint — preserves glass legibility */}
        <div className="absolute inset-0" style={{ background: 'rgba(2,2,9,0.78)' }} />

        {/* Neon glow casts from cyberpunk asset palette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 45% at 10% 90%, rgba(0,255,136,0.055) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 38% at 90% 8%, rgba(139,92,246,0.065) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 45% 32% at 55% 55%, rgba(34,211,238,0.03) 0%, transparent 55%)' }} />

        {/* Subtle edge vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 40%, rgba(2,2,9,0.5) 100%)' }} />
      </div>
    </>
  );
});

const PAGE_MAP = {
  home: PageHome, concierge: PageConcierge, warroom: PageWarRoom,
  infinity: PageInfinity, market: PageMarket, planner: PagePlanner,
  services: PageServices, kpis: PageKPIs, history: PageHistory, andy: PageAndy,
};

const PAGE_ORDER = ['home','concierge','warroom','infinity','market','planner','services','kpis','history','andy'];

export default function App() {
  const view = useStore((s) => s.view);
  const activePage = useStore((s) => s.activePage);
  const prevPage = useStore((s) => s.prevPage);
  const onboarded = useStore((s) => s.onboarded);
  const [loaded, setLoaded] = useState(() => false);

  const skipLoading = onboarded && view === 'dashboard';
  const showApp = loaded || skipLoading;

  const prevIdx = PAGE_ORDER.indexOf(prevPage || 'home');
  const currIdx = PAGE_ORDER.indexOf(activePage);
  const dir = currIdx >= prevIdx ? 1 : -1;

  const ActivePage = PAGE_MAP[activePage] || PageHome;

  return (
    <AppErrorBoundary>
      {/* ★ AMBIENT 3D VIDEO — scroll-scrubbed physics layer ★ */}
      {view === 'dashboard' && showApp && (
        <AmbientVideo pageIdx={currIdx} totalPages={PAGE_ORDER.length} />
      )}

      {/* Three.js particle layer sits on top of video */}
      <Suspense fallback={null}>
        <Background3D view={view} />
      </Suspense>

      {!skipLoading && !loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {showApp && (
        <>
          {/* INTRO — video handled within Intro.tsx */}
          <AnimatePresence>
            {view === 'intro' && (
              <motion.div key="intro" className="fixed inset-0 z-10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
                transition={{ duration: 0.9 }}>
                <PageSuspense><Intro /></PageSuspense>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ONBOARDING */}
          <AnimatePresence>
            {view === 'onboard' && (
              <motion.div key="onboard" className="fixed inset-0 z-10"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <PageSuspense><Onboarding /></PageSuspense>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <AppErrorBoundary>
              <StatsTicker />
              <SideNav />
              <TransitionOverlay />

              <div className="fixed inset-0 md:left-[72px] xl:left-[200px] top-6 bottom-0 z-30 overflow-hidden">
                <AnimatePresence mode="sync" custom={dir}>
                  <motion.div
                    key={activePage}
                    custom={dir}
                    variants={{
                      enter: (d) => ({ x: d * 60, opacity: 0, filter: 'blur(8px)' }),
                      center: { x: 0, opacity: 1, filter: 'blur(0px)' },
                      exit:   (d) => ({ x: d * -40, opacity: 0, filter: 'blur(4px)' }),
                    }}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <PageSuspense>
                      {/* id lets AmbientVideo connect its inner-scroll listener */}
                      <div id="page-content-panel" className="w-full h-full overflow-y-auto overflow-x-hidden">
                        <ActivePage />
                      </div>
                    </PageSuspense>
                  </motion.div>
                </AnimatePresence>
              </div>

              <FloatingAndy />
            </AppErrorBoundary>
          )}
        </>
      )}
    </AppErrorBoundary>
  );
}
