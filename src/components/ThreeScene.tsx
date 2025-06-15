
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // The auto-rotation from OrbitControls handles the spinning,
      // so we can remove the manual rotation to avoid conflicts.
      meshRef.current.position.y = Math.sin(time) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
      <torusKnotGeometry args={[0.9, 0.25, 256, 32, 3, 4]} />
      <MeshDistortMaterial
        color="#8e44ad"
        distort={0.45}
        speed={3}
        roughness={0.1}
        metalness={0.7}
      />
    </mesh>
  );
};

const ThreeScene = () => {
  return (
    <div className="w-full h-64 md:h-80 -mt-8 mb-4 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 3.5] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={2.5} color="#9b59b6" />
        <pointLight position={[-5, -5, -5]} intensity={3} color="#3498db" />
        <AnimatedShape />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
