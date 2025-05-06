import React, { useRef, useCallback, useMemo, memo } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TreeInfo } from '../../types';

interface CornPlantProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  daysPlanted?: number;
  id?: string;
  onClick?: (info: TreeInfo) => void;
  onHover?: (info: TreeInfo, isHovering: boolean) => void;
  status?: string;
}

const CornPlant: React.FC<CornPlantProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  daysPlanted = 0,
  id: _id,
  onClick,
  onHover,
  status
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const plantPosClone = useMemo<[number, number, number]>(() => [position[0], position[1], position[2]], [position]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onClick) {
      onClick({ id: _id, position: [...plantPosClone], daysPlanted, type: 'corn', status });
    }
  }, [_id, plantPosClone, daysPlanted, status, onClick]);

  const [isHovered, setIsHovered] = React.useState(false);
  const handlePointerOver = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isHovered) return;
    setIsHovered(true);
    if (onHover) {
      onHover({ id: _id, position: [...plantPosClone], daysPlanted, type: 'corn', status }, true);
    }
  }, [_id, plantPosClone, daysPlanted, status, onHover, isHovered]);
  const handlePointerOut = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    if (onHover) {
      onHover({ id: _id, position: [...plantPosClone], daysPlanted, type: 'corn', status }, false);
    }
  }, [_id, plantPosClone, daysPlanted, status, onHover]);

  // Chỉ load model 3D, không render fallback
  const gltf = useLoader(GLTFLoader, '/models/Corn_plant.glb');
  const growthFactor = Math.min(1, daysPlanted / 14); 

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive 
        object={gltf.scene.clone()} 
        scale={[scale * growthFactor, scale * growthFactor, scale * growthFactor]}
        position={[0, 0, 0]}
      />
    </group>
  );
};

interface CornPlantsProps {
  plants: Array<{
    id: string;
    daysPlanted: number;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    status?: string;
  }>;
  onPlantClick?: (info: TreeInfo) => void;
  onPlantHover?: (info: TreeInfo, isHovering: boolean) => void;
}

export const CornPlants: React.FC<CornPlantsProps> = ({ plants, onPlantClick, onPlantHover }) => {
  return (
    <group>
      {plants.map((plant) => {
        const plantPosition: [number, number, number] = [...plant.position] as [number, number, number];
        
        return (
          <CornPlant
            key={`corn-${plant.id}`}
            id={plant.id}
            position={plantPosition}
            rotation={plant.rotation}
            scale={plant.scale}
            daysPlanted={plant.daysPlanted}
            status={plant.status}
            onClick={onPlantClick}
            onHover={onPlantHover}
          />
        );
      })}
    </group>
  );
};

export default memo(CornPlant);
