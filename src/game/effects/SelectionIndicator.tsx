import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SelectionIndicatorProps {
  position: [number, number, number];
  size?: number;
  visible?: boolean;
  color?: string;
  mode?: 'select' | 'hover';  // Thêm 'hover' vào loại để tránh lỗi comparison
  groundOffset?: number;
}

// Component hiệu ứng chỉ báo khi chọn đối tượng (cây, ô đất...)
const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  position,
  size = 1,
  visible = true,
  color = '#4CAF50',
  mode = 'select',
  groundOffset = 0.02
}) => {
  // Create isolated refs for each component
  const containerRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groundRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const { scene } = useThree();
  
  // Tạo state riêng biệt cho từng instance indicator
  const [animTime, setAnimTime] = useState(0);
  const [groundPosition, setGroundPosition] = useState<[number, number, number]>([position[0], position[1] + groundOffset, position[2]]);
  const animSpeed = useMemo(() => 1, []);
  
  // Không sử dụng biến ringColor cho material để tránh lỗi unused variable
  // const ringColor = mode === 'hover' ? '#FFFFFF' : color;
  
  // Tìm vị trí chính xác trên mặt đất bằng raycasting
  useEffect(() => {
    // Tạo ray từ vị trí đối tượng hướng xuống
    const raycaster = new THREE.Raycaster();
    const rayOrigin = new THREE.Vector3(position[0], position[1] + 10, position[2]); // Điểm bắt đầu cao hơn vị trí đối tượng
    const rayDirection = new THREE.Vector3(0, -1, 0); // Hướng xuống
    raycaster.set(rayOrigin, rayDirection);
    
    // Tìm tất cả giao điểm với các object trong scene
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Lọc ra giao điểm với terrain (không phải là selection indicator hoặc các đối tượng khác)
    const terrainIntersect = intersects.find(intersect => {
      // Kiểm tra object có phải là SelectionIndicator không
      const obj = intersect.object;
      const isSelectionIndicator = obj.parent && 
                                  (obj.parent.userData?.type === 'selectionIndicator' || 
                                   obj.parent.parent?.userData?.type === 'selectionIndicator');
      
      // Nếu không phải là selection indicator và có giao điểm, thì đó là terrain
      return !isSelectionIndicator;
    });
    
    if (terrainIntersect) {
      // Đã tìm thấy giao điểm với terrain, đặt vị trí của vòng tròn tại đó
      const point = terrainIntersect.point;
      setGroundPosition([point.x, point.y + groundOffset, point.z]);
    } else {
      // Nếu không tìm thấy, sử dụng vị trí mặc định
      setGroundPosition([position[0], position[1] + groundOffset, position[2]]);
    }
  }, [position, groundOffset, scene]);
  
  // Create particles for sparkle effect - using useMemo to avoid recreating on each render
  const particles = useMemo(() => {
    // Nếu là mode hover thì không cần particles phức tạp
    if (mode === 'hover') return null;
    
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
  }, [size, mode]);
  
  // Animation loop - mỗi indicator sẽ có animation riêng biệt
  useFrame((_, delta) => {
    // Update local animation time
    setAnimTime(prevTime => prevTime + delta * animSpeed);
    
    // Animate ring - only apply to the ring itself
    if (ringRef.current) {      
      // Pulsing animation - different based on mode
      if (mode === 'select') {
        const scale = 1 + Math.sin(animTime * 3) * 0.1;
        ringRef.current.scale.set(scale, scale, scale);
      } else {
        // Hover mode - nhẹ nhàng hơn
        const scale = 1 + Math.sin(animTime * 1.5) * 0.05;
        ringRef.current.scale.set(scale, scale, scale);
      }
    }
    
    // Animate ground ring
    if (groundRingRef.current) {
      const pulseScale = 1 + Math.sin(animTime * 2) * 0.08;
      groundRingRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    // Animate particles
    if (mode === 'select' && particlesRef.current && particlesRef.current.geometry.attributes.position) {
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
  
  // Sử dụng key hoàn toàn cố định mà không phụ thuộc vào mode hoặc position
  const uniqueKey = 'selection-indicator'; 
  
  return (
    <group key={uniqueKey} userData={{ type: 'selectionIndicator' }}>
      {/* Indicator chính - đặt tại vị trí của đối tượng */}
      <group 
        ref={containerRef} 
        position={position} 
        matrixAutoUpdate={true}
        userData={{ type: 'selectionIndicator' }}
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
      
      {/* Vòng tròn luôn hiển thị trên mặt đất - sử dụng groundPosition từ raycasting */}
      <mesh
        ref={groundRingRef}
        position={groundPosition}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ type: 'selectionIndicator' }}
      >
        <ringGeometry args={[size * 0.85, size * 0.95, 32]} />
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Thêm một circle bên trong để có hiệu ứng đẹp hơn */}
      <mesh
        position={groundPosition}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ type: 'selectionIndicator' }}
      >
        <circleGeometry args={[size * 0.8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default memo(SelectionIndicator);