// @ts-nocheck
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function WealthCore({ phase }: { phase: 'intro' | 'dashboard' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.12;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={phase === 'intro' ? 2.2 : 0.8}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#030318"
          distort={0.45}
          speed={1.8}
          roughness={0.1}
          metalness={0.9}
          emissive="#00ff88"
          emissiveIntensity={0.08}
          wireframe={phase === 'dashboard'}
        />
      </mesh>
    </Float>
  );
}

function OrbitalRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ring1.current) ring1.current.rotation.z = t * 0.3;
    if (ring2.current) ring2.current.rotation.x = t * 0.2;
  });
  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.5, 0.015, 8, 100]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.12} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[5, 0.01, 8, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

export function Scene3D({ phase = 'intro' }: { phase?: 'intro' | 'dashboard' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 4]} intensity={2.5} color="#00ff88" />
      <pointLight position={[-6, -4, -4]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[0, -8, 2]} intensity={1} color="#0088ff" />

      <WealthCore phase={phase} />
      <OrbitalRings />

      <Stars radius={120} depth={60} count={6000} factor={3} saturation={0} fade speed={0.8} />
      <Sparkles count={400} scale={14} size={1.5} speed={0.3} opacity={0.15} color="#00ff88" />
    </Canvas>
  );
}
