import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function Planet({ position, color, size }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function SolarSystem3D() {
  // Simple positions and colors for Sun and planets
  const planets = [
    { name: 'Sun', color: '#FFD700', size: 2, pos: [0, 0, 0] },
    { name: 'Mercury', color: '#b1b1b1', size: 0.2, pos: [3, 0, 0] },
    { name: 'Venus', color: '#e6c97b', size: 0.4, pos: [4.5, 0, 0] },
    { name: 'Earth', color: '#3f51b5', size: 0.45, pos: [6, 0, 0] },
    { name: 'Mars', color: '#b5533c', size: 0.35, pos: [7.5, 0, 0] },
    { name: 'Jupiter', color: '#e0b07d', size: 1, pos: [10, 0, 0] },
    { name: 'Saturn', color: '#e5d7b7', size: 0.9, pos: [12, 0, 0] },
    { name: 'Uranus', color: '#b2e0e6', size: 0.6, pos: [14, 0, 0] },
    { name: 'Neptune', color: '#4666e5', size: 0.6, pos: [16, 0, 0] },
  ];

  return (
    <div style={{ height: 400, width: '100%', margin: '40px 0' }}>
      <Canvas camera={{ position: [0, 5, 20], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        <Stars radius={50} depth={60} count={500} factor={2} fade />
        {planets.map((p, i) => (
          <Planet key={p.name} position={p.pos} color={p.color} size={p.size} />
        ))}
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}

export default SolarSystem3D;