// @ts-nocheck
// OrbitalRings.tsx — Animated orbital rings with BufferGeometry instancing
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function OrbitalRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  // Memoized BufferGeometry — zero re-allocation
  const geo1 = useMemo(() => new THREE.TorusGeometry(3.2, 0.012, 8, 120), []);
  const geo2 = useMemo(() => new THREE.TorusGeometry(4.8, 0.008, 8, 120), []);
  const geo3 = useMemo(() => new THREE.TorusGeometry(6.5, 0.005, 8, 120), []);

  const mat1 = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00ff88', transparent: true, opacity: 0.14 }), []);
  const mat2 = useMemo(() => new THREE.MeshBasicMaterial({ color: '#8b5cf6', transparent: true, opacity: 0.09 }), []);
  const mat3 = useMemo(() => new THREE.MeshBasicMaterial({ color: '#0088ff', transparent: true, opacity: 0.06 }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ring1.current) { ring1.current.rotation.z = t * 0.28; ring1.current.rotation.x = Math.PI / 4; }
    if (ring2.current) { ring2.current.rotation.x = t * 0.18; ring2.current.rotation.y = Math.PI / 6; }
    if (ring3.current) { ring3.current.rotation.y = t * 0.12; ring3.current.rotation.z = Math.PI / 3; }
  });

  return (
    <>
      <mesh ref={ring1} geometry={geo1} material={mat1} />
      <mesh ref={ring2} geometry={geo2} material={mat2} />
      <mesh ref={ring3} geometry={geo3} material={mat3} />
    </>
  );
}
