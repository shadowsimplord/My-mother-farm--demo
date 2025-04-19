import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import GridSystem, { SoilState, SoilType } from './GridSystem';

interface FarmGridProps {
  gridSize?: number;
  tileSize?: number;
  position?: [number, number, number];
  onTileClick?: (x: number, z: number) => void;
}

const FarmGrid: React.FC<FarmGridProps> = ({ 
  gridSize = 10, 
  tileSize = 1,
  position = [0, 0.01, 0],  // Đặt cao hơn terrain một chút để tránh z-fighting
  onTileClick 
}) => {
  // Tạo hệ thống grid
  const gridSystem = useMemo(() => new GridSystem(gridSize, tileSize), [gridSize, tileSize]);
  
  // Tạo refs để theo dõi các ô đất
  const tileRefs = useRef<{[key: string]: THREE.Mesh}>({});
  
  // Tạo materials cho các loại đất khác nhau
  const materials = useMemo(() => {
    return {
      [SoilType.REGULAR]: new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.7 
      }),
      [SoilType.WET]: new THREE.MeshStandardMaterial({ 
        color: 0x654321, 
        roughness: 0.5,
        metalness: 0.1
      }),
      [SoilType.FERTILE]: new THREE.MeshStandardMaterial({ 
        color: 0x32CD32, 
        roughness: 0.6
      }),
      [SoilType.ROCKY]: new THREE.MeshStandardMaterial({ 
        color: 0x696969, 
        roughness: 0.9
      }),
      plowed: new THREE.MeshStandardMaterial({ 
        color: 0x3d2817, 
        roughness: 0.6,
        metalness: 0.1
      }),
      seeded: new THREE.MeshStandardMaterial({ 
        color: 0x3d2817,
        roughness: 0.6,
        metalness: 0.1
      }),
      growing: new THREE.MeshStandardMaterial({
        color: 0x556B2F,
        roughness: 0.5
      }),
      ready: new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.3,
        metalness: 0.2
      })
    };
  }, []);
  
  // Tạo một plane geometry cho các ô đất
  const tileGeometry = useMemo(() => new THREE.PlaneGeometry(tileSize * 0.9, tileSize * 0.9), [tileSize]);
  
  // Xử lý click vào ô đất
  const handleTileClick = (x: number, z: number) => {
    if (onTileClick) {
      onTileClick(x, z);
    }
  };
  
  // Animation và cập nhật grid
  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime() * 1000; // Đổi sang ms
    
    // Cập nhật sự phát triển của cây trồng
    gridSystem.updateCrops(currentTime);
    
    // Cập nhật màu sắc và scale cho từng ô đất
    const grid = gridSystem.getGrid();
    for (let x = 0; x < grid.length; x++) {
      for (let z = 0; z < grid[x].length; z++) {
        const tile = grid[x][z];
        const tileRef = tileRefs.current[`${x}-${z}`];
        
        if (tileRef) {
          // Cập nhật material dựa trên trạng thái
          let material;
          
          switch (tile.state) {
            case SoilState.PLOWED:
              material = materials.plowed;
              break;
            case SoilState.SEEDED:
              material = materials.seeded;
              break;
            case SoilState.GROWING:
              material = materials.growing;
              break;
            case SoilState.READY:
              material = materials.ready;
              break;
            default:
              material = materials[tile.type];
          }
          
          // Áp dụng material mới
          if (tileRef.material !== material) {
            tileRef.material = material;
          }
          
          // Hiển thị giai đoạn phát triển của cây bằng cách thay đổi scale
          if (tile.state === SoilState.GROWING && tile.plantStage !== undefined) {
            const scale = 1 + tile.plantStage * 0.5;
            tileRef.scale.set(1, 1, scale);
            
            // Có thể thêm animation nữa tại đây
            tileRef.position.y = tile.plantStage * 0.1;
          }
        }
      }
    }
  });
  
  // Render
  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Tạo tất cả các ô đất */}
      {gridSystem.getGrid().map((row, x) =>
        row.map((tile, z) => (
          <mesh
            key={`tile-${x}-${z}`}
            ref={(el) => {
              if (el) tileRefs.current[`${x}-${z}`] = el;
            }}
            geometry={tileGeometry}
            material={materials[tile.type]}
            position={[tile.worldPosition.x, 0, tile.worldPosition.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              handleTileClick(x, z);
            }}
          />
        ))
      )}
    </group>
  );
};

export default FarmGrid;