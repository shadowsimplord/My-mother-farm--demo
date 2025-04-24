import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SelectionIndicatorProps {
  position: [number, number, number];
  size?: number;
  visible?: boolean;
  color?: string;
}

// Component hiệu ứng chỉ báo khi chọn đối tượng (cây, ô đất...)
const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  position,
  size = 1,
  visible = true,
  color = '#4CAF50'
}) => {
  // Create isolated refs for each component
  const containerRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Tạo state riêng biệt cho từng instance indicator
  // Thay vì dùng ref chung cho animation state, chúng ta dùng useState
  const [animTime, setAnimTime] = useState(0);
  const animSpeed = useMemo(() => 1, []);
  
  // Create particles for sparkle effect - using useMemo to avoid recreating on each render
  const particles = useMemo(() => {
    // Create geometry
    const particleCount = 30;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position in circle
      const angle = Math.random() * Math.PI * 2;
      const radius = (0.7 + Math.random() * 0.5) * size;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.1 + Math.random() * 0.3; // Slightly above ground
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Random size for each particle
      sizes[i] = 0.03 + Math.random() * 0.04;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, [size]);
  
  // Animation loop - mỗi indicator sẽ có animation riêng biệt
  useFrame((_, delta) => {
    // Update local animation time
    setAnimTime(prevTime => prevTime + delta * animSpeed);
    
    // Animate ring - only apply to the ring itself
    if (ringRef.current) {      
      // Pulsing animation
      const scale = 1 + Math.sin(animTime * 3) * 0.1;
      ringRef.current.scale.set(scale, scale, scale);
    }
    
    // Animate particles
    if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
      // Make particles pulse
      const positions = particlesRef.current.geometry.attributes.position;
      const count = positions.count;
      
      for (let i = 0; i < count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        
        // Oscillate radius
        const newRadius = radius + Math.sin(animTime * 5 + i * 0.5) * 0.05;
        
        positions.setX(i, Math.cos(angle) * newRadius);
        positions.setZ(i, Math.sin(angle) * newRadius);
      }
      
      positions.needsUpdate = true;
    }
  });
  
  if (!visible) return null;
  
  // Mỗi indicator được tạo với một key duy nhất dựa trên vị trí
  const uniqueKey = `indicator-${position.join('-')}`;
  
  return (
    <group 
      ref={containerRef} 
      position={position} 
      key={uniqueKey}
      // Đảm bảo rằng transform chỉ áp dụng cho group này
      matrixAutoUpdate={true}
    >
      {/* Ring indicator không còn xoay */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[size * 0.7, size * 0.8, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Particle effects không còn xoay */}
      {particles && (
        <points ref={particlesRef}>
          <primitive object={particles} attach="geometry" />
          <pointsMaterial
            size={0.1}
            color={color}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};

export default SelectionIndicator;