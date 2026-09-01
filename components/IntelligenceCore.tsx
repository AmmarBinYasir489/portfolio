'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function MechanicalIris({ reduced }: { reduced: boolean }) {
  const assembly = useRef<THREE.Group>(null);
  const iris = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Group[]>([]);
  const keyLight = useRef<THREE.PointLight>(null);
  const pointer = useRef({ x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastX: innerWidth / 2, lastY: innerHeight / 2, lastTime: performance.now() });
  const scroll = useRef(0);

  const bladeShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.25, -0.62);
    shape.lineTo(0.16, -0.5);
    shape.lineTo(0.38, 0.38);
    shape.quadraticCurveTo(0.28, 0.62, -0.06, 0.7);
    shape.lineTo(-0.36, 0.2);
    shape.closePath();
    return shape;
  }, []);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(now - pointer.current.lastTime, 16);
      const dx = event.clientX - pointer.current.lastX;
      const dy = event.clientY - pointer.current.lastY;
      pointer.current.x = event.clientX / innerWidth * 2 - 1;
      pointer.current.y = -(event.clientY / innerHeight * 2 - 1);
      pointer.current.vx = clamp(dx / dt * 2.4, -1, 1);
      pointer.current.vy = clamp(-dy / dt * 2.4, -1, 1);
      pointer.current.speed = clamp(Math.hypot(dx, dy) / dt * 1.7);
      pointer.current.lastX = event.clientX;
      pointer.current.lastY = event.clientY;
      pointer.current.lastTime = now;
    };
    const onScroll = () => { scroll.current = clamp(scrollY / Math.max(innerHeight * 1.35, 1)); };
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { removeEventListener('pointermove', onPointer); removeEventListener('scroll', onScroll); };
  }, []);

  useFrame((_, delta) => {
    if (reduced || !assembly.current || !iris.current) return;
    const interaction = pointer.current;
    const progress = scroll.current;
    const speed = interaction.speed;
    const damp = (current: number, target: number, smoothing: number) => THREE.MathUtils.damp(current, target, smoothing, delta);

    assembly.current.rotation.x = damp(assembly.current.rotation.x, -interaction.y * 0.09 + interaction.vy * 0.03 + progress * 0.12, 3.4);
    assembly.current.rotation.y = damp(assembly.current.rotation.y, interaction.x * 0.14 + interaction.vx * 0.045 + progress * 0.24, 3.4);
    assembly.current.rotation.z = damp(assembly.current.rotation.z, -interaction.x * 0.025 + progress * 0.18, 2.4);
    assembly.current.position.x = damp(assembly.current.position.x, interaction.x * 0.07, 3);
    assembly.current.position.y = damp(assembly.current.position.y, interaction.y * 0.05 - progress * 0.1, 3);
    assembly.current.position.z = damp(assembly.current.position.z, -progress * 1.15, 2.5);
    const targetScale = 1 + speed * 0.025 - progress * 0.16;
    assembly.current.scale.setScalar(damp(assembly.current.scale.x, targetScale, 3));

    const aperture = 0.76 + progress * 0.18 + speed * 0.035;
    blades.current.forEach((blade, index) => {
      const angle = index / 8 * Math.PI * 2;
      blade.position.x = Math.cos(angle) * aperture;
      blade.position.y = Math.sin(angle) * aperture;
      blade.rotation.z = angle + 0.72 + progress * 0.3 + speed * 0.05;
      blade.rotation.x = damp(blade.rotation.x, interaction.y * 0.02, 3.5);
    });
    iris.current.rotation.z = damp(iris.current.rotation.z, progress * 0.34 + interaction.x * 0.018, 2.3);

    if (keyLight.current) {
      keyLight.current.position.x = damp(keyLight.current.position.x, 2.8 + interaction.x * 2.6 + interaction.vx, 4.5);
      keyLight.current.position.y = damp(keyLight.current.position.y, 2.4 + interaction.y * 2.2 + interaction.vy, 4.5);
      keyLight.current.intensity = damp(keyLight.current.intensity, 15 + speed * 7, 4.5);
    }
    interaction.vx = damp(interaction.vx, 0, 6);
    interaction.vy = damp(interaction.vy, 0, 6);
    interaction.speed = damp(interaction.speed, 0, 5.5);
  });

  const bladeMaterial = { color: '#8d8b86', metalness: 0.93, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 };
  return <group ref={assembly} rotation={[0.08, -0.12, -0.08]}>
    <group ref={iris}>
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.18, 64]} />
        <meshPhysicalMaterial color="#090908" metalness={0.76} roughness={0.08} transmission={0.18} thickness={1.1} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0, -0.29]}>
        <circleGeometry args={[0.32, 64]} />
        <meshStandardMaterial color="#d74b20" emissive="#b72d10" emissiveIntensity={.72} roughness={0.42} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = index / 8 * Math.PI * 2;
        return <group key={index} ref={(node) => { if (node) blades.current[index] = node; }} position={[Math.cos(angle) * 0.73, Math.sin(angle) * 0.73, index * 0.008]} rotation={[0, 0, angle + 0.72]}>
          <mesh>
            <extrudeGeometry args={[bladeShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 3 }]} />
            <meshPhysicalMaterial {...bladeMaterial} />
          </mesh>
        </group>;
      })}
      <mesh rotation={[0, 0, 0.12]}><torusGeometry args={[1.55, 0.035, 12, 160, Math.PI * 1.68]} /><meshStandardMaterial color="#dedad1" metalness={.96} roughness={.18} /></mesh>
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 12]}>
        <ringGeometry args={[1.96, 2.1, 12]} />
        <meshPhysicalMaterial color="#8c8982" metalness={.96} roughness={.14} clearcoat={1} clearcoatRoughness={.08} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <circleGeometry args={[1.96, 96]} />
        <meshPhysicalMaterial color="#8d9699" transparent opacity={.14} transmission={.86} thickness={1.6} roughness={.05} metalness={.16} clearcoat={1} clearcoatRoughness={.03} depthWrite={false} />
      </mesh>
    </group>
    <pointLight ref={keyLight} position={[3, 3, 5]} intensity={18} color="#fffdf7" distance={12} />
  </group>;
}

export default function IntelligenceCore() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return <Canvas aria-hidden="true" camera={{ position: [0, 0, 5.65], fov: 38 }} dpr={[1, 1.55]} frameloop={reduced ? 'demand' : 'always'} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
    <ambientLight intensity={0.42} />
    <directionalLight position={[-4, -3, 5]} intensity={.48} color="#ff6a2e" />
    <directionalLight position={[4, 2, -2]} intensity={1.5} color="#938b80" />
    <MechanicalIris reduced={reduced} />
  </Canvas>;
}
