import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TreeType } from '../systems/TreeSpawner';

// Tree model paths - you'll need to add these model files to your assets directory
const TREE_MODELS = {
  pine: '/src/assets/models/pine_tree.glb', // Replace with actual path
  oak: '/src/assets/models/oak_tree.glb',   // Replace with actual path
  birch: '/src/assets/models/birch_tree.glb' // Replace with actual path
};

// Placeholder geometry for when models aren't loaded
const createPlaceholderGeometry = (type: TreeType) => {
  switch (type) {
    case 'pine':
      return new THREE.ConeGeometry(0.5, 2, 8);
    case 'oak':
      return new THREE.SphereGeometry(0.7, 8, 8);
    case 'birch':
      return new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    default:
      return new THREE.BoxGeometry(0.5, 1, 0.5);
  }
};

// Placeholder materials for different tree types
const PLACEHOLDER_MATERIALS = {
  pine: new THREE.MeshStandardMaterial({ color: '#1a472a' }),
  oak: new THREE.MeshStandardMaterial({ color: '#2e7d32' }),
  birch: new THREE.MeshStandardMaterial({ color: '#81c784' }),
};

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
  const [modelLoaded, setModelLoaded] = useState(false);

  // Use a placeholder initially
  const geometry = createPlaceholderGeometry(type);
  const material = PLACEHOLDER_MATERIALS[type];
  
  // Try to load the GLTF model
  /*
  // Uncomment this when you have the models
  try {
    const gltf = useLoader(GLTFLoader, TREE_MODELS[type]);
    
    useEffect(() => {
      if (gltf) {
        setModelLoaded(true);
      }
    }, [gltf]);
    
    // Return the actual model if loaded
    if (modelLoaded && gltf) {
      return (
        <primitive
          object={gltf.scene.clone()}
          position={position}
          rotation={rotation}
          scale={[scale, scale, scale]}
        />
      );
    }
  } catch (error) {
    console.warn(`Failed to load tree model for type ${type}:`, error);
    // Fall back to placeholder
  }
  */
  
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