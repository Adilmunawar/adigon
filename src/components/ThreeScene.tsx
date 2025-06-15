
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const innerMeshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle bobbing motion for the whole group
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.05;
    }
    if (innerMeshRef.current) {
      // Independent, slower rotation for the inner shape to create complexity
      innerMeshRef.current.rotation.x = time * 0.1;
      innerMeshRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Sphere */}
      <mesh scale={1.6}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#ff9900"
          wireframe
          emissive="#ff9900"
          emissiveIntensity={1.2}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Inner Torus Knot */}
      <mesh ref={innerMeshRef} scale={1.2}>
        <torusKnotGeometry args={[0.9, 0.2, 128, 16, 3, 4]} />
        <meshStandardMaterial
          color="#ffddaa"
          wireframe
          emissive="#ffddaa"
          emissiveIntensity={1}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

const ThreeScene = () => {
  return (
    <div className="w-full h-64 md:h-80 -mt-8 mb-4 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
        <ambientLight intensity={0.1} />
        <directionalLight color="#ffaa44" position={[0, 0, 5]} intensity={2.5} />
        <AnimatedShape />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
