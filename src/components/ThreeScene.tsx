import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.position.y = Math.sin(time) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
      <torusKnotGeometry args={[0.9, 0.25, 256, 32, 3, 4]} />
      <meshPhysicalMaterial 
        color="#ffffff"
        metalness={0.2}
        roughness={0.05}
        transmission={1.0}
        thickness={1.5}
        ior={1.7}
        clearcoat={1}
        clearcoatRoughness={0}
      />
    </mesh>
  );
};

const ThreeScene = () => {
  return (
    <div className="w-full h-64 md:h-80 -mt-8 mb-4 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 3.5] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2.5} color="#9b59b6" />
        <pointLight position={[-5, -5, -5]} intensity={3} color="#3498db" />
        <AnimatedShape />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
