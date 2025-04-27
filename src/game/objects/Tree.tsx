import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TreeType } from '../systems/TreeSpawner';

interface TreeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type?: TreeType;
}

const Tree: React.FC<TreeProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  type = 'pine'
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Debug vị trí cây
  useEffect(() => {
    // Log position for debugging
    console.log(`Tree positioned at: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]`);
  }, [position]);

  // Return placeholder geometry if model loading fails or is in progress
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      castShadow={true}
      receiveShadow={true}
    >
      {type === 'pine' && (
        <>
          {/* Trunk - ĐIỀU CHỈNH: di chuyển phần thân xuống dưới điểm gốc để đảm bảo cây đúng điểm (0,0,0) */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
          
          {/* Foliage layers - ĐIỀU CHỈNH: điều chỉnh vị trí tương ứng */}
          <mesh position={[0, 0.0, 0]}>
            <coneGeometry args={[0.7, 1.2, 8]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.5, 0.8, 8]} />
            <meshStandardMaterial color="#388E3C" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.3, 0.5, 8]} />
            <meshStandardMaterial color="#43A047" roughness={0.7} />
          </mesh>
        </>
      )}
      
      {type === 'oak' && (
        <>
          {/* Trunk - ĐIỀU CHỈNH: di chuyển phần thân xuống dưới điểm gốc */}
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 1.0, 8]} />
            <meshStandardMaterial color="#795548" roughness={0.8} />
          </mesh>
          
          {/* Foliage - ĐIỀU CHỈNH: điều chỉnh vị trí tương ứng */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.8, 8, 8]} />
            <meshStandardMaterial color="#4CAF50" roughness={0.7} />
          </mesh>
        </>
      )}
      
      {type === 'birch' && (
        <>
          {/* Trunk - ĐIỀU CHỈNH: di chuyển phần thân xuống dưới điểm gốc */}
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 1.4, 8]} />
            <meshStandardMaterial color="#E0E0E0" roughness={0.6} />
          </mesh>
          
          {/* Foliage - ĐIỀU CHỈNH: điều chỉnh vị trí tương ứng */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color="#81C784" roughness={0.7} />
          </mesh>
        </>
      )}
    </mesh>
  );
};

// Component to render multiple trees
interface TreesProps {
  trees: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    type?: TreeType;
  }>;
}

export const Trees: React.FC<TreesProps> = ({ trees }) => {
  return (
    <group>
      {trees.map((tree, index) => (
        <Tree
          key={`tree-${index}`}
          position={tree.position}
          rotation={tree.rotation}
          scale={tree.scale}
          type={tree.type}
        />
      ))}
    </group>
  );
};

export default Tree;