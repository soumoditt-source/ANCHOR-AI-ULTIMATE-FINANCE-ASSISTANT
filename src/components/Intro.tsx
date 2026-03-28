// @ts-nocheck
/**
 * Intro.tsx — Cinematic landing page with RAF physics-based scroll-driven video
 *
 * Scroll DOWN → accumulates positive velocity → video currentTime advances (3D fly-in)
 * Scroll UP   → accumulates negative velocity → video scrubs backward (3D retreat)
 * Friction decay per RAF frame gives elastic, physical deceleration
 * Scale transform follows velocity magnitude giving actual 3D zoom feel
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Anchor, ArrowRight, LogIn, TrendingUp, Shield, Zap, Play } from 'lucide-react';
import { useStore } from '../store/useStore';

const FEATURES = [
  { icon: TrendingUp, label: '6D Money Health Score', desc: 'Emergency · Insurance · FIRE · Debt · Tax · Diversification' },
  { icon: Shield,     label: 'Debt Annihilation Engine', desc: 'Avalanche · Snowball · Velocity — pick your weapon' },
  { icon: Zap,        label: 'FIRE Path Planner', desc: 'Month-by-month SIP · Retirement roadmap · Asset shifts' },
  { icon: Play,       label: 'Andy AI CFO', desc: 'Voice chat · 9 languages · Document scanning' },
  { icon: ArrowRight, label: 'Tax Wizard', desc: 'Form 16 upload · Old vs New regime · AI deductions' },
  { icon: LogIn,      label: 'ET Markets Intelligence', desc: 'NSE · SENSEX · Crypto · Sentiment AI' },
];

const STATS = [
  { val: '95%', label: 'Indians lack a plan' },
  { val: '₹0', label: 'Cost to start' },
  { val: '9', label: 'AI modules' },
  { val: '∞', label: 'FIRE paths' },
];

export function Intro() {
  const setView = useStore((s) => s.setView);
  const [videoReady, setVideoReady] = useState(false);
  const [launching, setLaunching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  // Auto-play video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; v.playsInline = true; v.loop = true;
    const onCanPlay = () => { setVideoReady(true); v.play().catch(() => {}); };
    v.addEventListener('canplaythrough', onCanPlay);
    if (v.readyState >= 3) { setVideoReady(true); v.play().catch(() => {}); }
    return () => v.removeEventListener('canplaythrough', onCanPlay);
  }, []);

  // ── RAF Physics Scrub ──────────────────────────────────────────────────────
  // Velocity accumulator + exponential friction drives currentTime forward/backward
  // Also drives a 3D scale on the video wrapper (zoom-in = fly forward, zoom-out = retreat)
  useEffect(() => {
    const v = videoRef.current;
    const wrapper = containerRef.current?.querySelector('.video-3d-wrapper') as HTMLElement | null;
    if (!v) return;

    let velocity = 0;
    let prevTs = 0;
    let raf = 0;
    const FRICTION = 0.87;
    const SCRUB_SPEED = 0.005;
    const BASE_SCALE = 1.06;
    const MAX_SCALE_BOOST = 0.12; // max extra scale at peak velocity

    const loop = (ts: number) => {
      const dt = ts - (prevTs || ts);
      prevTs = ts;

      if (Math.abs(velocity) > 0.01) {
        if (v.duration) {
          const delta = velocity * SCRUB_SPEED * (dt / 16);
          v.currentTime = Math.max(0, Math.min(v.duration - 0.02, v.currentTime + delta));
        }
        // 3D scale — zoom in when moving forward, out when retreating
        if (wrapper) {
          const boost = Math.min(Math.abs(velocity) / 200, 1) * MAX_SCALE_BOOST;
          const scale = velocity > 0 ? BASE_SCALE + boost : BASE_SCALE - boost * 0.5;
          wrapper.style.transform = `scale(${scale.toFixed(4)})`;
          wrapper.style.transition = 'transform 0.08s linear';
        }
        velocity *= FRICTION;
      } else {
        velocity = 0;
        if (wrapper) wrapper.style.transform = `scale(${BASE_SCALE})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const addV = (dy: number) => { velocity += dy; };

    let lastY = 0;
    const onWheel = (e: WheelEvent) => addV(e.deltaY);
    const onTouchStart = (e: TouchEvent) => { lastY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      addV((lastY - e.touches[0].clientY) * 2);
      lastY = e.touches[0].clientY;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const handleLaunch = useCallback(() => {
    if (launching) return;
    setLaunching(true);
    // Pause / slow on click for dramatic effect
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.3;
    }
    setTimeout(() => setView('onboard'), 1000);
  }, [launching, setView]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden">

      {/* ── VIDEO LAYER ── */}
      <div className="absolute inset-0 z-0">
        {/* video-3d-wrapper: scale is driven by scroll velocity for 3D zoom */}
        <div className="video-3d-wrapper absolute inset-0" style={{ transform: 'scale(1.06)', willChange: 'transform' }}>
          <video
            ref={videoRef}
            src="/bg-video-1.mp4"
            className="absolute inset-0 w-full h-full object-cover object-center"
            muted
            playsInline
            preload="auto"
            loop
          />
        </div>

        {/* Multi-layer overlays — cinematic depth stack */}
        <div className="absolute inset-0" style={{ background: 'rgba(2,2,9,0.58)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 25%, rgba(2,2,9,0.85) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-48"
          style={{ background: 'linear-gradient(to top, rgba(2,2,9,0.98) 0%, transparent 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-28"
          style={{ background: 'linear-gradient(to bottom, rgba(2,2,9,0.75) 0%, transparent 100%)' }} />
        {/* Neon color casts — matches user PNG assets */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 45% at 15% 85%, rgba(0,255,136,0.09) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 38% at 85% 15%, rgba(139,92,246,0.10) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 40% 30% at 62% 62%, rgba(34,211,238,0.05) 0%, transparent 60%)' }} />
        {/* CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 3px)' }} />
      </div>

      {/* ── SCROLL HINT ── */}
      <motion.div
        className="absolute left-0 right-0 bottom-20 flex flex-col items-center gap-1.5 pointer-events-none z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2 }}>
        <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Scroll to scrub video</p>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="w-4 h-6 rounded-full border border-white/20 flex items-start justify-center pt-1">
            <div className="w-1 h-1.5 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </motion.div>

      {/* ── HERO CONTENT ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto py-12 md:py-0 mt-20 md:mt-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo mark — floating */}
        <motion.div
          className="relative mb-4 md:mb-8"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-[#00ff88] via-[#00cc6a] to-[#0088ff] flex items-center justify-center"
            style={{ boxShadow: '0 0 80px rgba(0,255,136,0.5), 0 0 160px rgba(0,255,136,0.2)' }}>
            <Anchor className="w-14 h-14 text-black" strokeWidth={2.5} />
          </div>
          {/* Orbital rings */}
          {[1, 1.6, 2.2].map((scale, i) => (
            <motion.div key={i} className="absolute inset-0 rounded-3xl border border-[#00ff88]/15"
              animate={{ scale: [1, scale, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </motion.div>

        {/* ANCHOR AI title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black tracking-tighter leading-none mb-1 md:mb-2 mt-4 md:mt-0">
            <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">ANCHOR</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00ddff] to-[#8b5cf6]"
              style={{ WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 30px rgba(0,255,136,0.4))' }}> AI</span>
          </h1>
          <motion.p className="text-[#00ff88]/60 font-mono text-xs md:text-sm tracking-[0.2em] md:tracking-[0.45em] uppercase mb-4 md:mb-6"
            animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }}>
            Gen AI Money Mentor · ET Hackathon 2026 · India's CFO for Everyone
          </motion.p>
        </motion.div>

        <motion.p className="text-white/50 text-base md:text-lg max-w-2xl mb-6 md:mb-8 leading-relaxed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          95% of Indians have no financial plan. Financial advisors cost ₹25,000+ per year.<br/>
          <span className="text-[#00ff88]">Andy AI is your always-on CFO — free, multilingual, and smarter than Wall Street.</span>
        </motion.p>

        {/* Stats row */}
        <motion.div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-black text-white" style={{ textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>{s.val}</span>
              <span className="text-[9px] md:text-[10px] text-white/30 font-mono uppercase">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl glass border border-white/[0.07]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}>
              <f.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88]" />
              <span className="text-white/70 text-xs md:text-sm">{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA — TAP TO ENTER */}
        <AnimatePresence>
          {!launching ? (
            <motion.button
              key="cta"
              onClick={handleLaunch}
              className="group relative flex items-center gap-2 md:gap-3 px-8 py-3.5 md:px-14 md:py-5 rounded-2xl text-black font-black text-lg md:text-xl overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              style={{ boxShadow: '0 0 60px rgba(0,255,136,0.4)' }}>
              {/* Button fill */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88] to-[#0088ff]" />
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
              <LogIn className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Initialize System</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
          ) : (
            <motion.div key="launching"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center"
                style={{ boxShadow: '0 0 60px rgba(0,255,136,0.6)' }}>
                <Play className="w-8 h-8 text-black" />
              </div>
              <p className="text-[#00ff88] font-mono text-sm uppercase tracking-widest animate-pulse">Initializing System...</p>
              {/* Loading bar */}
              <div className="w-64 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-[#00ff88] to-[#0088ff]"
                  initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.9 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom trust badges */}
        <motion.div className="mt-6 md:mt-10 flex flex-wrap justify-center items-center gap-3 md:gap-4 text-white/20 text-[10px] md:text-xs font-mono"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          {['Finnhub Markets', 'Gemini AI', 'CoinGecko Crypto', 'Supabase Auth', 'Web Speech API'].map((t, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00ff88]/30" />
              {t}
            </span>
          ))}
        </motion.div>

        <motion.p className="mt-4 text-white/15 text-[10px] font-mono"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          Engineered by Soumoditya Das | ET Gen AI Hackathon 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
