// @ts-nocheck
// Lights.tsx — Dedicated light rig for the wealth scene
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SceneLights() {
  const pointRef = useRef<THREE.PointLight>(null);

  // Subtle light animation — breathes in sync with orb
  useFrame(({ clock }) => {
    if (pointRef.current) {
      const t = clock.elapsedTime;
      pointRef.current.intensity = 2.0 + Math.sin(t * 0.8) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      {/* Primary green key light */}
      <pointLight ref={pointRef} position={[5, 5, 4]} color="#00ff88" intensity={2.0} distance={20} decay={2} />
      {/* Purple fill */}
      <pointLight position={[-6, -3, -3]} color="#8b5cf6" intensity={1.4} distance={18} decay={2} />
      {/* Blue rim */}
      <pointLight position={[0, -8, 2]} color="#0088ff" intensity={0.9} distance={15} decay={2} />
      {/* Warm accent */}
      <directionalLight position={[10, 8, 5]} intensity={0.3} color="#ffffff" />
    </>
  );
}
