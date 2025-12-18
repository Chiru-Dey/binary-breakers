import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Stars } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

function Shard({ position, color, speed, factor }) {
  const ref = useRef();

  useFrame((state, delta) => {
    // Rotate constantly
    ref.current.rotation.x += delta * speed * 0.5;
    ref.current.rotation.y += delta * speed;

    // Gentle floating handled by <Float> but we add some dynamic scaling
    const t = state.clock.getElapsedTime();
    ref.current.scale.setScalar(1 + Math.sin(t * factor) * 0.1);
  });

  const geometry = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);

  return (
    <Float rotationIntensity={2} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
      <mesh ref={ref} position={position}>
        <primitive object={geometry} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeBackground() {
  const [shards] = useState(() => Array.from({ length: 30 }, () => ({
    position: [
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10 - 5
    ],
    color: Math.random() > 0.5 ? '#ff4d4d' : '#00e6e6',
    speed: Math.random() * 0.5 + 0.2,
    factor: Math.random() * 2 + 1
  })));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <fog attach="fog" args={['#0a0a0a', 10, 40]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ff4d4d" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#00e6e6" />
        <spotLight position={[0, 10, 0]} intensity={1} penumbra={1} />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {shards.map((shard, i) => (
          <Shard key={i} {...shard} />
        ))}

        <Environment preset="city" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-brand-dark/80" />
    </div>
  );
}
