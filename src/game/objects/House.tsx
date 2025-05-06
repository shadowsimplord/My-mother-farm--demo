import React, { useRef, memo } from 'react';
import * as THREE from 'three';

interface HouseProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const House: React.FC<HouseProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0
}) => {
  const houseRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={houseRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    >
      {/* Nền nhà */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[3.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#A9A9A9" roughness={0.9} side={THREE.FrontSide} />
      </mesh>
      
      {/* Thân nhà chính - gỗ */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[3, 1.4, 2]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} metalness={0.1} side={THREE.FrontSide} />
      </mesh>
      
      {/* Đường kẻ ngang trên thân nhà */}
      <mesh castShadow receiveShadow position={[0, 0.7, 1.01]}>
        <boxGeometry args={[3.02, 0.05, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} side={THREE.FrontSide} />
      </mesh>
      
      {/* Đường kẻ dọc trên thân nhà - mặt trước */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, index) => (
        <mesh key={index} castShadow receiveShadow position={[x, 0.7, 1.01]}>
          <boxGeometry args={[0.05, 1.4, 0.01]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} side={THREE.FrontSide} />
        </mesh>
      ))}
      
      {/* Mái nhà kiểu tam giác */}
      <mesh castShadow position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2.2, 1.2, 4, 1, false, Math.PI/4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.1} side={THREE.FrontSide} />
      </mesh>
      
      {/* Ống khói */}
      <mesh castShadow position={[1, 1.9, 0.5]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#A52A2A" roughness={0.9} side={THREE.FrontSide} />
      </mesh>
      
      {/* Cửa chính */}
      <mesh castShadow position={[0, 0.5, 1.01]}>
        <boxGeometry args={[0.6, 1.0, 0.05]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0} side={THREE.FrontSide} />
      </mesh>
      
      {/* Tay nắm cửa */}
      <mesh castShadow position={[0.2, 0.5, 1.07]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#DAA520" roughness={0.3} metalness={0.5} side={THREE.FrontSide} />
      </mesh>
      
      {/* Cửa sổ trái */}
      <mesh castShadow position={[-0.9, 0.7, 1.02]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshPhysicalMaterial 
          color="#B0E0E6" 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.7}
          transparent={true}
          opacity={0.7}
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Khung cửa sổ trái */}
      <mesh castShadow position={[-0.9, 0.7, 1.03]}>
        <boxGeometry args={[0.55, 0.55, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      
      {/* Thanh chéo cửa sổ trái */}
      <mesh castShadow position={[-0.9, 0.7, 1.042]}>
        <boxGeometry args={[0.55, 0.05, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      <mesh castShadow position={[-0.9, 0.7, 1.042]} rotation={[0, 0, Math.PI/2]}>
        <boxGeometry args={[0.55, 0.05, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      
      {/* Cửa sổ phải */}
      <mesh castShadow position={[0.9, 0.7, 1.02]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshPhysicalMaterial 
          color="#B0E0E6" 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.7}
          transparent={true}
          opacity={0.7}
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Khung cửa sổ phải */}
      <mesh castShadow position={[0.9, 0.7, 1.03]}>
        <boxGeometry args={[0.55, 0.55, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      
      {/* Thanh chéo cửa sổ phải */}
      <mesh castShadow position={[0.9, 0.7, 1.042]}>
        <boxGeometry args={[0.55, 0.05, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      <mesh castShadow position={[0.9, 0.7, 1.042]} rotation={[0, 0, Math.PI/2]}>
        <boxGeometry args={[0.55, 0.05, 0.01]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      
      {/* Bậc thềm nhà */}
      <mesh receiveShadow position={[0, 0.05, 1.4]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#B8860B" roughness={0.8} side={THREE.FrontSide} />
      </mesh>
      
      {/* Sân nhỏ phía trước */}
      <mesh receiveShadow position={[0, 0.02, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 1.6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} side={THREE.FrontSide} />
      </mesh>
      
      {/* Chậu hoa bên trái */}
      <mesh castShadow position={[-1, 0.15, 1.7]}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} side={THREE.FrontSide} />
      </mesh>
      <mesh castShadow position={[-1, 0.377, 1.7]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#FF6347" roughness={0.7} side={THREE.FrontSide} />
      </mesh>
      <mesh castShadow position={[-1, 0.3, 1.7]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.7} side={THREE.FrontSide} />
      </mesh>
      
      {/* Chậu hoa bên phải */}
      <mesh castShadow position={[1, 0.15, 1.7]}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} side={THREE.FrontSide} />
      </mesh>
      <mesh castShadow position={[1, 0.377, 1.7]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.7} side={THREE.FrontSide} />
      </mesh>
      <mesh castShadow position={[1, 0.3, 1.7]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.7} side={THREE.FrontSide} />
      </mesh>
    </group>
  );
};

export default memo(House);