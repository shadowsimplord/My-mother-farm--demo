import React, { useRef, useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { TreeInfo } from '../../types';

interface CherryTreeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  daysPlanted?: number;
  id?: string;
  onClick?: (info: TreeInfo) => void;
  onHover?: (info: TreeInfo, isHovering: boolean) => void;
  status?: string;
}

const CherryTree: React.FC<CherryTreeProps> = ({
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
  const treePosClone = useMemo<[number, number, number]>(() => 
    [position[0], position[1], position[2]], 
    [position]
  );
  
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onClick) {
      onClick({ 
        id: _id, 
        position: [...treePosClone], 
        daysPlanted, 
        type: 'cherry', 
        status 
      });
    }
  }, [_id, treePosClone, daysPlanted, status, onClick]);
  
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
        position: [...treePosClone],
        daysPlanted, 
        type: 'cherry', 
        status 
      }, true);
    }
  }, [_id, treePosClone, daysPlanted, status, onHover, isHovered]);
  
  const handlePointerOut = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // Reset trạng thái hover
    setIsHovered(false);
    
    if (onHover) {
      onHover({ 
        id: _id, 
        position: [...treePosClone],
        daysPlanted, 
        type: 'cherry', 
        status 
      }, false);
    }
  }, [_id, treePosClone, daysPlanted, status, onHover]);
  
  const colors = {
    trunk: '#8B4513', // Nâu sẫm
    branches: '#A0522D', // Nâu đỏ
    smallBranches: '#CD853F', // Nâu vàng nhạt
    leaves: '#228B22', // Xanh lá đậm
    lightLeaves: '#32CD32', // Xanh lá nhạt
    blossoms: '#FFB7C5', // Hồng nhạt (cho hoa)
    cherries: '#B22222', // Đỏ sẫm
    ripeCherries: '#FF0000' // Đỏ tươi
  };

  const growthFactor = Math.min(1, daysPlanted / 12);
  const treeScale = 0.6 + growthFactor * 0.4;

  const hasBlossoms = daysPlanted >= 3 && daysPlanted < 7;
  const hasFruits = daysPlanted >= 7;
  const hasMatureFruits = daysPlanted >= 10;

  // Tạo và lưu trữ giá trị ngẫu nhiên cho cấu trúc cây - chỉ tính toán 1 lần
  const treeStructure = useMemo(() => {
    // Tạo một đối tượng để lưu trữ tất cả dữ liệu ngẫu nhiên cho cây
    const branches = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4]
      .map((angle, idx) => {
        const height = [1.0, 0.9, 1.0, 0.95, 1.0, 0.9, 1.0, 0.95][idx];
        const tilt = [0.05, 0.1, 0.07, 0.1, 0.05, 0.1, 0.07, 0.1][idx];
        const branchLength = 0.5 + Math.random() * 0.3;
        const randomRotation = Math.random() * 0.1;
        const leafRandomFactor = Math.random(); // Để quyết định màu lá
        // Thêm kích thước ngẫu nhiên cho lá chính
        const mainLeafSize = 0.25 + Math.random() * 0.1;

        // Lưu trữ dữ liệu cho các nhánh con
        const subBranches = [0.4, 0.7, 1.0].map(() => {
          const subAngle = angle + (Math.random() * 0.5 - 0.25);
          const subTilt = tilt + (Math.random() * 0.3 - 0.15);
          
          // Phần trái/hoa ngẫu nhiên
          const hasFruitCluster = Math.random() > 0.4;
          const cherryCount = 2 + Math.floor(Math.random() * 3);
          const cherries = Array(cherryCount).fill(0).map(() => ({
            offset: [
              Math.random() * 0.08 - 0.04,
              -0.05 - Math.random() * 0.02,
              Math.random() * 0.08 - 0.04
            ] as [number, number, number]
          }));

          // Phần hoa ngẫu nhiên
          const hasFlowerCluster = Math.random() > 0.3;
          const flowerCount = 3 + Math.floor(Math.random() * 3);
          const flowers = Array(flowerCount).fill(0).map(() => ({
            offset: [
              Math.random() * 0.1 - 0.05,
              Math.random() * 0.06,
              Math.random() * 0.1 - 0.05
            ] as [number, number, number]
          }));

          // Phần lá ngẫu nhiên
          const leaves = [1, 2, 3].map(() => {
            const leafAngle = subAngle + (Math.random() * Math.PI - Math.PI/2);
            const dist = 0.1 + Math.random() * 0.05;
            const height = Math.random() * 0.08;
            const rotX = Math.random() * 0.5 - 0.25;
            const rotZ = Math.random() * 0.5 - 0.25;
            const isLightLeaf = Math.random() > 0.3;
            
            return {
              leafAngle,
              dist,
              height,
              rotations: [rotX, leafAngle, rotZ] as [number, number, number],
              isLightLeaf
            };
          });

          return {
            subAngle,
            subTilt,
            hasFruitCluster,
            cherries,
            hasFlowerCluster,
            flowers,
            leaves
          };
        });

        return {
          angle,
          height,
          tilt,
          branchLength,
          randomRotation,
          leafRandomFactor,
          mainLeafSize,
          subBranches
        };
      });

    // Lá rơi dưới gốc cây
    const fallenLeaves = daysPlanted > 8 ? [1, 2, 3].map(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.2 + Math.random() * 0.3;
      const rotX = -Math.PI/2 + (Math.random() * 0.2 - 0.1);
      const rotY = Math.random() * Math.PI * 2;
      
      return {
        angle,
        distance,
        rotation: [rotX, rotY, 0] as [number, number, number]
      };
    }) : [];

    return {
      branches,
      fallenLeaves
    };
  }, [daysPlanted]); // Chỉ cần daysPlanted là đủ

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale * treeScale, scale * treeScale, scale * treeScale]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Thân cây */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 1.0, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} side={THREE.FrontSide} />
      </mesh>

      {/* Phần gốc cây */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} side={THREE.FrontSide} />
      </mesh>

      {/* Phần thân trên phân nhánh */}
      <mesh castShadow position={[0, 1.1, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.07, 0.12, 0.5, 6]} />
        <meshStandardMaterial color={colors.branches} roughness={0.8} side={THREE.FrontSide} />
      </mesh>
      
      <mesh castShadow position={[0, 1.1, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.07, 0.12, 0.5, 6]} />
        <meshStandardMaterial color={colors.branches} roughness={0.8} side={THREE.FrontSide} />
      </mesh>

      {/* Nhánh chính - sử dụng giá trị từ treeStructure */}
      {treeStructure.branches.map((branch, idx) => {
        const branchY = 0.9 + branch.height * growthFactor;
        
        return (
          <group key={`branch-${idx}`}>
            {/* Nhánh chính */}
            <mesh 
              castShadow 
              position={[0, branchY, 0]} 
              rotation={[branch.tilt, branch.angle, branch.randomRotation]}
            >
              <cylinderGeometry args={[0.04, 0.06, branch.branchLength, 5]} />
              <meshStandardMaterial color={colors.branches} roughness={0.7} side={THREE.FrontSide} />
            </mesh>

            {/* Tán lá chính */}
            <mesh 
              castShadow
              position={[
                Math.sin(branch.angle) * (branch.branchLength * 0.7),
                branchY + 0.2,
                Math.cos(branch.angle) * (branch.branchLength * 0.7)
              ]}
            >
              <sphereGeometry args={[branch.mainLeafSize, 8, 8]} />
              <meshStandardMaterial 
                color={branch.leafRandomFactor > 0.5 ? colors.leaves : colors.lightLeaves} 
                roughness={0.7} 
                side={THREE.FrontSide} 
              />
            </mesh>

            {/* Nhánh nhỏ và lá - sử dụng giá trị từ treeStructure */}
            {branch.subBranches.map((subBranch, subIdx) => {
              const pos = [0.4, 0.7, 1.0][subIdx];
              const origin = {
                x: Math.sin(branch.angle) * (branch.branchLength * pos),
                y: branchY + branch.tilt * pos * 2,
                z: Math.cos(branch.angle) * (branch.branchLength * pos)
              };

              return (
                <group key={`subbranch-${idx}-${subIdx}`}>
                  {/* Các chùm quả cherry */}
                  {hasFruits && subBranch.hasFruitCluster && (
                    <group position={[origin.x, origin.y - 0.1, origin.z]}>
                      {/* Cuống quả */}
                      <mesh castShadow position={[0, 0.05, 0]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.1, 4]} />
                        <meshStandardMaterial color="#654321" roughness={0.5} side={THREE.FrontSide} />
                      </mesh>

                      {/* Quả cherry */}
                      {subBranch.cherries.map((cherry, cherryIdx) => (
                        <mesh 
                          key={`cherry-${idx}-${subIdx}-${cherryIdx}`} 
                          castShadow 
                          position={cherry.offset}
                        >
                          <sphereGeometry args={[0.04, 6, 6]} />
                          <meshStandardMaterial 
                            color={hasMatureFruits ? colors.ripeCherries : colors.cherries} 
                            roughness={0.3} 
                            metalness={0.1}
                            side={THREE.FrontSide} 
                          />
                        </mesh>
                      ))}
                    </group>
                  )}

                  {/* Hoa cherry */}
                  {hasBlossoms && !hasFruits && subBranch.hasFlowerCluster && (
                    <group position={[origin.x, origin.y, origin.z]}>
                      {subBranch.flowers.map((flower, flowerIdx) => (
                        <mesh 
                          key={`blossom-${idx}-${subIdx}-${flowerIdx}`} 
                          castShadow 
                          position={flower.offset}
                        >
                          <sphereGeometry args={[0.03, 6, 6]} />
                          <meshStandardMaterial color={colors.blossoms} roughness={0.5} side={THREE.FrontSide} />
                        </mesh>
                      ))}
                    </group>
                  )}

                  {/* Tán lá nhỏ */}
                  <mesh 
                    castShadow
                    position={[origin.x, origin.y, origin.z]}
                  >
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshStandardMaterial color={colors.leaves} roughness={0.7} side={THREE.FrontSide} />
                  </mesh>

                  {/* Chi tiết lá */}
                  {subBranch.leaves.map((leaf, leafIdx) => (
                    <mesh 
                      key={`leaf-${idx}-${subIdx}-${leafIdx}`}
                      castShadow
                      position={[
                        origin.x + Math.sin(leaf.leafAngle) * leaf.dist,
                        origin.y + leaf.height,
                        origin.z + Math.cos(leaf.leafAngle) * leaf.dist
                      ]}
                      rotation={leaf.rotations}
                    >
                      <planeGeometry args={[0.08, 0.12]} />
                      <meshStandardMaterial 
                        color={leaf.isLightLeaf ? colors.lightLeaves : colors.leaves} 
                        side={THREE.DoubleSide}
                        roughness={0.7}
                      />
                    </mesh>
                  ))}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Lá rơi dưới gốc cây */}
      {treeStructure.fallenLeaves.map((leaf, idx) => (
        <mesh 
          key={`fallen-leaf-${idx}`}
          position={[
            Math.sin(leaf.angle) * leaf.distance,
            0.01,
            Math.cos(leaf.angle) * leaf.distance
          ]}
          rotation={leaf.rotation}
        >
          <planeGeometry args={[0.1, 0.15]} />
          <meshStandardMaterial 
            color="#A0522D" 
            side={THREE.DoubleSide}
            roughness={0.9} 
          />
        </mesh>
      ))}
    </group>
  );
};

interface CherryTreesProps {
  trees: Array<{
    id: string;
    daysPlanted: number;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    status?: string;
  }>;
  onTreeClick?: (info: TreeInfo) => void;
  onTreeHover?: (info: TreeInfo, isHovering: boolean) => void;
}

export const CherryTrees: React.FC<CherryTreesProps> = ({ trees, onTreeClick, onTreeHover }) => {
  return (
    <group>
      {trees.map((tree) => {
        const treePosition: [number, number, number] = [...tree.position] as [number, number, number];
        
        return (
          <CherryTree
            key={`cherry-${tree.id}`}
            id={tree.id}
            position={treePosition}
            rotation={tree.rotation}
            scale={tree.scale}
            daysPlanted={tree.daysPlanted}
            status={tree.status}
            onClick={onTreeClick}
            onHover={onTreeHover}
          />
        );
      })}
    </group>
  );
};

export default CherryTree;