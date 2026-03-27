import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  emoji: string;
}

const SYMBOLS = ['💸', '₿', '🏦', '📈', '🚀', '💎', '💰'];

export default function DataRain() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: -10,
          size: Math.random() * 15 + 10,
          duration: Math.random() * 8 + 8,
          emoji: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}px`,
            filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.3))'
          }}
          initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [0, 0.8, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: particle.duration,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
}
