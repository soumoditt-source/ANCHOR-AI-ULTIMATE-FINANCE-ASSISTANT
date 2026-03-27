// @ts-nocheck
/**
 * VideoBackground.tsx
 * Dual-mode video background:
 *  - "intro": full-screen, full-opacity, plays on user interaction
 *  - "ambient": ~14% opacity, 40px blur, dark tint — always playing behind all panels
 *
 * Scroll-driven logic: when the user scrolls inside a page panel, the video's
 * currentTime advances proportionally (scrubbed, not real-time).
 */
import { memo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  mode: 'intro' | 'ambient';
  /** 0-1: how far through the app journey the user is (drives video scrub) */
  progress?: number;
  /** page scroll offset 0-1 from the parent page panel */
  scrollProgress?: number;
  playing?: boolean;
  onEnded?: () => void;
}

// We use Video 1 for the intro cinematic and Video 2 for the ambient layer
export const VideoBackground = memo(function VideoBackground({
  mode,
  progress = 0,
  scrollProgress = 0,
  playing = true,
  onEnded,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const videoSrc = mode === 'intro' ? '/bg-video-1.mp4' : '/bg-video-2.mp4';
  const durationRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = 0;
    el.muted = true;
    el.playsInline = true;

    const onMeta = () => { durationRef.current = el.duration; };
    el.addEventListener('loadedmetadata', onMeta);

    if (onEnded) el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('loadedmetadata', onMeta);
      if (onEnded) el.removeEventListener('ended', onEnded);
    };
  }, [onEnded]);

  // Play / pause
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing]);

  // Scroll-driven scrubbing for intro mode
  useEffect(() => {
    if (mode !== 'intro') return;
    const el = ref.current;
    if (!el || !durationRef.current) return;
    const target = (progress + scrollProgress * 0.3) * durationRef.current;
    // Smooth nudge
    el.currentTime = Math.min(target, durationRef.current - 0.05);
  }, [mode, progress, scrollProgress]);

  if (mode === 'intro') {
    return (
      <div className="fixed inset-0 z-0">
        <video
          ref={ref}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover object-center"
          muted
          playsInline
          preload="auto"
          loop={false}
        />
        {/* Cinematic dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(2,2,9,0.55) 0%, rgba(2,2,9,0.3) 40%, rgba(2,2,9,0.72) 100%)',
          }}
        />
        {/* Subtle vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(2,2,9,0.7) 100%)',
          }}
        />
      </div>
    );
  }

  // ambient mode — blurred, low opacity, always looping
  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <video
        ref={ref}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover object-center"
        muted
        playsInline
        loop
        autoPlay
        preload="auto"
        style={{ filter: 'blur(40px) saturate(1.2)', transform: 'scale(1.08)' }}
      />
      {/* Dark tint so UI glass cards remain legible */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(2, 2, 9, 0.82)' }}
      />
      {/* Neon green / purple color cast */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,136,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)',
        }}
      />
    </motion.div>
  );
});
