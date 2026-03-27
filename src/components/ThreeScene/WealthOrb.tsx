// @ts-nocheck
// WealthOrb.tsx — Core animated wealth sphere with Three.js BufferGeometry
// Uses MeshDistortMaterial for organic morphing effect
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface WealthOrbProps {
  scale?: number;
  wireframe?: boolean;
  distort?: number;
}

export function WealthOrb({ scale = 2.0, wireframe = false, distort = 0.42 }: WealthOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Memoize geometry to avoid re-creation on every render
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 64, 64), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.10;
    meshRef.current.rotation.x = Math.sin(t * 0.18) * 0.12;
  });

  // Cleanup on unmount — critical for memory management
  const handleRef = (mesh: THREE.Mesh | null) => {
    if (!mesh && meshRef.current) {
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose());
      } else {
        meshRef.current.material?.dispose?.();
      }
    }
    (meshRef as any).current = mesh;
  };

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={handleRef as any} scale={scale} geometry={geometry}>
        <MeshDistortMaterial
          color="#030318"
          distort={distort}
          speed={1.6}
          roughness={0.08}
          metalness={0.92}
          emissive="#00ff88"
          emissiveIntensity={wireframe ? 0.02 : 0.06}
          wireframe={wireframe}
        />
      </mesh>
    </Float>
  );
}
