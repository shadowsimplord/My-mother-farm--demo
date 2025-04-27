import React, { useRef, useCallback, useMemo, Suspense, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Sửa đúng import path
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

// Tạo component riêng biệt để load model, tránh vi phạm rule of hooks
const CornModel = ({ scale, growthFactor }: { scale: number, growthFactor: number }) => {
  // Đường dẫn đúng, bắt đầu từ thư mục public
  const gltf = useLoader(GLTFLoader, '/models/Corn_plant.glb');
  
  return (
    <primitive 
      object={gltf.scene.clone()} 
      scale={[scale * growthFactor, scale * growthFactor, scale * growthFactor]}
      position={[0, 0, 0]}
    />
  );
};

// Component fallback khi model đang load hoặc lỗi
const CornFallbackModel = ({ 
  colors, 
  growthFactor, 
  hasDriedLeaves, 
  plantHeight
}: { 
  colors: any, 
  growthFactor: number, 
  hasDriedLeaves: boolean, 
  plantHeight: number 
}) => {
  // Tương tự như phiên bản code hiện tại của bạn
  return (
    <>
      {/* Thân cây ngô */}
      <mesh castShadow position={[0, plantHeight/2, 0]}>
        <cylinderGeometry args={[0.05, 0.08, plantHeight, 6]} />
        <meshStandardMaterial color={colors.stalk} roughness={0.8} />
      </mesh>
      
      {/* Các lá ngô cơ bản */}
      <mesh castShadow position={[0.15, plantHeight * 0.3, 0]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color={colors.leaves} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      
      <mesh castShadow position={[-0.15, plantHeight * 0.5, 0]} rotation={[0, 0, 0.2]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color={colors.lightLeaves} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      
      <mesh castShadow position={[0.2, plantHeight * 0.7, 0]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color={colors.leaves} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      
      {/* Bắp ngô nếu đủ tuổi */}
      {growthFactor > 0.5 && (
        <mesh castShadow position={[0.12, plantHeight * 0.6, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.06, 0.04, 0.25, 8]} />
          <meshStandardMaterial color={colors.cornHusk} roughness={0.8} />
        </mesh>
      )}
      
      {/* Lá khô khi già */}
      {hasDriedLeaves && (
        <mesh position={[0, 0.01, 0.2]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color={colors.dryLeaves} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      )}
    </>
  );
};

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
  
  // Sử dụng useMemo để tránh tạo lại mảng position mỗi lần render
  const plantPosClone = useMemo<[number, number, number]>(() => 
    [position[0], position[1], position[2]], 
    [position]
  );
  
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onClick) {
      onClick({ 
        id: _id, 
        position: [...plantPosClone], 
        daysPlanted, 
        type: 'corn', 
        status 
      });
    }
  }, [_id, plantPosClone, daysPlanted, status, onClick]);
  
  // Thêm state để theo dõi trạng thái hover
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerOver = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // Tránh gửi nhiều sự kiện khi đã đang hover
    if (isHovered) return;
    
    // Đánh dấu là đang hover
    setIsHovered(true);
    
    if (onHover) {
      onHover({ 
        id: _id, 
        position: [...plantPosClone],
        daysPlanted, 
        type: 'corn', 
        status 
      }, true);
    }
  }, [_id, plantPosClone, daysPlanted, status, onHover, isHovered]);

  const handlePointerOut = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // Reset trạng thái hover
    setIsHovered(false);
    
    if (onHover) {
      onHover({ 
        id: _id, 
        position: [...plantPosClone],
        daysPlanted, 
        type: 'corn', 
        status 
      }, false);
    }
  }, [_id, plantPosClone, daysPlanted, status, onHover]);
  
  const colors = {
    stalk: '#4C9900', // Thân cây ngô
    leaves: '#008800', // Lá xanh đậm
    lightLeaves: '#66BB00', // Lá xanh nhạt
    cornSilk: '#FFF5C2', // Râu bắp ngô
    cornHusk: '#88AA00', // Vỏ bắp
    dryLeaves: '#D4AF37' // Lá khô
  };
  
  // Các thông số tăng trưởng
  const growthFactor = Math.min(1, daysPlanted / 14); 
  const plantHeight = 0.5 + growthFactor * 1.5;
  const hasDriedLeaves = daysPlanted >= 10;
  
  // Quyết định có load model hay không
  const useModel = daysPlanted > 3; // Chỉ load model khi cây đã lớn
  
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
      {useModel ? (
        <Suspense fallback={<CornFallbackModel 
          colors={colors}
          growthFactor={growthFactor}
          hasDriedLeaves={hasDriedLeaves}
          plantHeight={plantHeight}
        />}>
          <CornModel scale={scale} growthFactor={growthFactor} />
        </Suspense>
      ) : (
        <CornFallbackModel 
          colors={colors}
          growthFactor={growthFactor}
          hasDriedLeaves={hasDriedLeaves}
          plantHeight={plantHeight}
        />
      )}
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

export default CornPlant;
