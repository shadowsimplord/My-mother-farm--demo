import React, { useRef, useCallback, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { ThreeEvent } from '@react-three/fiber';
import { FarmUIInterface } from '../../../scenes/FarmUI';

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

interface FieldProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  rows?: number;
  columns?: number;
  spacing?: number;
}

// Preload model
useGLTF.preload('/models/Corn_plant.glb');

const CornPlant: React.FC<{
  position: [number, number, number];
  scale: number;
}> = ({ position, scale }) => {
  const { scene } = useGLTF('/models/Corn_plant.glb') as unknown as GLTFResult;
  
  // Clone the model for individual corn plant
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);
  
  // Apply random rotation to make field look more natural
  const randomRotation = useMemo(() => {
    return [0, Math.random() * Math.PI * 2, 0];
  }, []);
  
  // Add slight random scale variation
  const randomScale = useMemo(() => {
    const variation = 0.85 + Math.random() * 0.3;
    return scale * variation;
  }, [scale]);

  return (
    <primitive 
      object={clonedScene} 
      position={position}
      rotation={randomRotation as [number, number, number]} 
      scale={randomScale} 
    />
  );
};

const Field: React.FC<FieldProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  rows = 5,
  columns = 5,
  spacing = 1.5
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create ground for the corn field
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(columns * spacing, rows * spacing), [rows, columns, spacing]);
  const groundMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#5a3c1b', 
    roughness: 0.8,
    metalness: 0.1
  }), []);

  // Generate positions for corn plants
  const cornPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const fieldWidth = (columns - 1) * spacing;
    const fieldHeight = (rows - 1) * spacing;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const x = j * spacing - fieldWidth / 2;
        const z = i * spacing - fieldHeight / 2;
        // Add slight random position variation
        const randomOffset = 0.2;
        const randomX = x + (Math.random() * randomOffset * 2 - randomOffset);
        const randomZ = z + (Math.random() * randomOffset * 2 - randomOffset);
        positions.push([randomX, 0, randomZ]);
      }
    }
    return positions;
  }, [rows, columns, spacing]);

  // Sửa hàm xử lý click
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log('[Field] Field clicked');
    
    // Phát sự kiện field-clicked để SceneInteractionHelper biết
    window.dispatchEvent(new CustomEvent('field-clicked'));
    
    // Hiển thị thông tin cánh đồng giống như cách hiển thị thông tin cây
    if (window.farmUI?.setSelectedField) {
      window.farmUI.setSelectedField(true);
    }
    
    // Gọi callback nếu có
    if (onClick) onClick(e);
  }, [onClick]);

  // Add gentle movement effect
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle wind effect
      const time = state.clock.getElapsedTime();
      groupRef.current.children.forEach((child, index) => {
        if (index > 0) { // Skip the ground (first child)
          const factor = Math.sin(time * 1.5 + index * 0.3) * 0.015;
          child.rotation.z = factor;
          child.rotation.x = factor * 0.5;
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      onClick={handleClick}
      dispose={null}
    >
      {/* Ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        geometry={groundGeometry} 
        material={groundMaterial} 
        onClick={handleClick}
      />
      
      {/* Corn plants */}
      {cornPositions.map((pos, index) => (
        <CornPlant 
          key={index} 
          position={pos} 
          scale={0.25}
        />
      ))}
    </group>
  );
};

// Thêm vào interface window để TypeScript biết về farmUI
declare global {
  interface Window {
    farmUI?: FarmUIInterface;
  }
}

export default Field;