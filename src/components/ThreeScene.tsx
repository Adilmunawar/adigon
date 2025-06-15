
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle rotation for the whole group to make it feel alive
      groupRef.current.rotation.y = time * 0.05;
      groupRef.current.rotation.x = time * 0.025;

      // Make inner spheres rotate independently for a complex, fluid motion
      groupRef.current.children.forEach((child, index) => {
        if (index > 0) { // Don't apply to the outermost shell
          child.rotation.y = time * (0.1 + index * 0.05);
          child.rotation.x = time * (0.05 + index * 0.02);
        }
      });
    }
  });
  
  const Sphere = ({ scale, color, opacity, emissiveIntensity = 0.4 }) => (
    <mesh scale={scale}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.1}
        depthWrite={false} // Important for transparency sorting
      />
    </mesh>
  );

  return (
    <group ref={groupRef}>
      {/* Siri-like layered spheres */}
      <Sphere scale={1.7} color="#a373ff" opacity={0.1} />
      <Sphere scale={1.4} color="#8d5cff" opacity={0.15} />
      <Sphere scale={1.1} color="#c09eff" opacity={0.2} />
      <Sphere scale={0.7} color="#f0dfff" opacity={0.9} emissiveIntensity={1} />
    </group>
  );
};

const ThreeScene = () => {
  return (
    <div className="w-full h-64 md:h-80 -mt-8 mb-4 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight color="#d6baff" position={[0, 0, 5]} intensity={1.5} />
        <AnimatedShape />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
