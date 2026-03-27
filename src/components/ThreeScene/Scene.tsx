// @ts-nocheck
// Scene.tsx — Premium 360° outer space scene with skybox sphere
// architecture: Scene → SceneLights + Skybox360 + CoreKnot + OrbitalRings + FloatingIcos + Rocket + DataNodes
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { SceneLights } from './Lights';
import { OrbitalRings } from './OrbitalRings';

export type ScenePhase = 'intro' | 'dashboard';

// ── 360° Skybox Sphere ────────────────────────────────────────────────────────
// Giant sphere with BackSide rendering — camera is INSIDE the sphere.
// Creates immersive 360° cosmic environment.
function Skybox360() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(80, 32, 32), []);
  const mat = useMemo(() => {
    // Gradient shader material for aurora-like sky
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform float time;
        void main() {
          vec3 dir = normalize(vPos);
          // Deep space gradient
          float y = dir.y * 0.5 + 0.5;
          vec3 top = vec3(0.01, 0.01, 0.06);       // deep navy
          vec3 mid = vec3(0.0, 0.04, 0.02);        // dark teal
          vec3 bot = vec3(0.03, 0.0, 0.06);        // deep violet
          vec3 col = mix(bot, mix(mid, top, y * y), y);
          // Aurora pulse
          float aurora = sin(dir.x * 4.0 + time * 0.3) * sin(dir.z * 3.0 + time * 0.2) * 0.5 + 0.5;
          aurora *= (1.0 - abs(dir.y)) * 0.06;
          col += vec3(0.0, aurora, aurora * 0.3);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    (ref.current.material as THREE.ShaderMaterial).uniforms.time.value = clock.elapsedTime;
    ref.current.rotation.y = clock.elapsedTime * 0.008;
  });

  return <mesh ref={ref} geometry={geo} material={mat} />;
}

// ── TorusKnot Core ─────────────────────────────────────────────────────────────
function CoreKnot({ phase }: { phase: ScenePhase }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.TorusKnotGeometry(1.2, 0.38, 160, 20, 2, 3), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.x = t * 0.09;
    ref.current.rotation.y = t * 0.13;
    ref.current.rotation.z = Math.sin(t * 0.2) * 0.08;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1.0}>
      <mesh ref={ref} geometry={geo} scale={phase === 'intro' ? 1.6 : 0.7}>
        <MeshDistortMaterial
          color="#030318"
          distort={0.3}
          speed={1.5}
          metalness={0.95}
          roughness={0.05}
          emissive="#00ff88"
          emissiveIntensity={phase === 'intro' ? 0.07 : 0.04}
        />
      </mesh>
    </Float>
  );
}

// ── Floating Wireframe Icosahedra ─────────────────────────────────────────────
const ICO_CONFIGS = [
  { pos: [4.5, 2.5, -2] as [number,number,number], scale: 0.52, speed: 0.11, color: '#8b5cf6' },
  { pos: [-4.2, -1.8, -3] as [number,number,number], scale: 0.38, speed: -0.08, color: '#00ff88' },
  { pos: [3.0, -3.5, -1] as [number,number,number], scale: 0.28, speed: 0.14, color: '#0088ff' },
  { pos: [-3.8, 3.2, -4] as [number,number,number], scale: 0.45, speed: -0.07, color: '#f59e0b' },
  { pos: [5.5, -0.5, -5] as [number,number,number], scale: 0.22, speed: 0.18, color: '#8b5cf6' },
  { pos: [-5.0, 1.0, -3] as [number,number,number], scale: 0.32, speed: -0.12, color: '#22d3ee' },
];
const sharedIcoGeo = new THREE.IcosahedronGeometry(1, 0);

function FloatingIco({ pos, scale, speed, color }: typeof ICO_CONFIGS[0]) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 }), [color]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.x = t * speed;
    ref.current.rotation.y = t * speed * 0.7;
    ref.current.position.y = pos[1] + Math.sin(t * 0.5 + pos[0]) * 0.28;
  });
  return <mesh ref={ref} position={pos} scale={scale} geometry={sharedIcoGeo} material={mat} />;
}

// ── Rocket Streak ─────────────────────────────────────────────────────────────
function RocketStreak() {
  const ref = useRef<THREE.Group>(null);
  const bodyGeo = useMemo(() => new THREE.ConeGeometry(0.05, 0.30, 6), []);
  const finGeo  = useMemo(() => new THREE.BoxGeometry(0.12, 0.08, 0.02), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00ff88', transparent: true }), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const cycle = (t * 0.45) % 9;
    const y = -6 + cycle * 1.9;
    ref.current.position.set(Math.sin(t * 0.28) * 2.0, y, -2.5);
    ref.current.rotation.z = Math.sin(t * 0.28) * 0.22;
    const opacity = cycle < 1 ? cycle : cycle > 7 ? Math.max(0, 9 - cycle) / 2 : 1;
    mat.opacity = opacity;
  });

  return (
    <group ref={ref}>
      <mesh geometry={bodyGeo} material={mat} />
      {/* Fins */}
      <mesh geometry={finGeo} material={mat} position={[0, -0.16, 0]} rotation={[0, 0, Math.PI / 4]} />
      <mesh geometry={finGeo} material={mat} position={[0, -0.16, 0]} rotation={[0, 0, -Math.PI / 4]} />
      {/* Engine glow */}
      <pointLight color="#00ff88" intensity={1.2} distance={3} position={[0, -0.2, 0]} />
    </group>
  );
}

// ── Pulsing Data Nodes ────────────────────────────────────────────────────────
const NODE_POS: [number,number,number][] = [[-7,4,-8],[7,-3,-9],[-6,-5,-7],[8,2,-10],[-8,0,-11]];
const sharedNodeGeo = new THREE.SphereGeometry(0.07, 8, 8);
const sharedNodeMat = new THREE.MeshBasicMaterial({ color: '#00ff88', transparent: true, opacity: 0.75 });

function DataNodes() {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => { if (m) m.scale.setScalar(1 + Math.sin(t * 1.4 + i * 1.3) * 0.35); });
  });
  return (
    <>{NODE_POS.map((p, i) => <mesh key={i} ref={el => { refs.current[i] = el; }} position={p} geometry={sharedNodeGeo} material={sharedNodeMat} />)}</>
  );
}

// ── Main Scene Export ─────────────────────────────────────────────────────────
export function Scene({ phase = 'intro' }: { phase?: ScenePhase }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 11], fov: 46, near: 0.1, far: 300 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', precision: 'highp' }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      style={{ position: 'absolute', inset: 0 }}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 800 } }}
    >
      {/* 360° skybox — camera is inside this sphere */}
      <Skybox360 />

      {/* Light rig */}
      <SceneLights />

      {/* Geometric hero */}
      <CoreKnot phase={phase} />

      {/* Decoration */}
      <OrbitalRings />
      {ICO_CONFIGS.map((c, i) => <FloatingIco key={i} {...c} />)}
      <RocketStreak />
      <DataNodes />

      {/* Deep starfield */}
      <Stars radius={60} depth={50} count={phase === 'intro' ? 5000 : 2500} factor={3} saturation={0} fade speed={0.5} />

      {/* Sparkles */}
      <Sparkles count={phase === 'intro' ? 300 : 100} scale={16} size={1.6} speed={0.2} opacity={0.1} color="#00ff88" />
    </Canvas>
  );
}
