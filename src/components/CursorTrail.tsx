// @ts-nocheck
import { useEffect, useRef } from 'react';

export function CursorTrail() {
  const trailRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: fixed; pointer-events: none; z-index: 9999;
        width: ${8 - i * 0.5}px; height: ${8 - i * 0.5}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,255,136,${1 - i * 0.08}) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: opacity 0.1s;
      `;
      document.body.appendChild(dot);
      dots.push(dot);
    }
    trailRef.current = dots;

    const positions: { x: number; y: number }[] = Array(12).fill({ x: -100, y: -100 });

    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);

    let raf: number;
    const animate = () => {
      positions[0] = { x: pos.current.x, y: pos.current.y };
      for (let i = 1; i < 12; i++) {
        positions[i] = {
          x: positions[i].x + (positions[i - 1].x - positions[i].x) * 0.35,
          y: positions[i].y + (positions[i - 1].y - positions[i].y) * 0.35,
        };
      }
      dots.forEach((d, i) => {
        d.style.left = positions[i].x + 'px';
        d.style.top = positions[i].y + 'px';
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      dots.forEach(d => d.remove());
    };
  }, []);

  return null;
}
