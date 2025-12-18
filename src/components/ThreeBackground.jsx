import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef, useState } from 'react';

function Particle({ position, color, speed }) {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.x += delta * speed * 0.5;
    ref.current.rotation.y += delta * speed;
  });

  return (
    <mesh ref={ref} position={position} scale={0.08}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  const [particles] = useState(() => Array.from({ length: 150 }, () => ({
    position: [
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20 - 5
    ],
    color: Math.random() > 0.5 ? '#ff4d4d' : '#00e6e6',
    speed: Math.random() * 0.8 + 0.2
  })));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <fog attach="fog" args={['#0a0a0a', 15, 50]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff4d4d" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00e6e6" />

        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

        {particles.map((particle, i) => (
          <Particle key={i} {...particle} />
        ))}
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-brand-dark/70" />
    </div>
  );
}
