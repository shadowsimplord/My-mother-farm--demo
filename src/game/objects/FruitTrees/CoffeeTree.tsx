import React, { useRef, useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { TreeInfo } from '../../types';

// Loại cây cà phê và các loại cây khác có thể thêm sau này
export type CoffeeTreeType = 'caphe_vietnam' | 'caphe_arabica' | 'caphe_robusta';

interface CoffeeTreeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type?: CoffeeTreeType;
  daysPlanted?: number;
  id?: string;
  status?: string;
  onClick?: (info: TreeInfo) => void;
  onHover?: (info: TreeInfo, isHovering: boolean) => void;
}

const CoffeeTree: React.FC<CoffeeTreeProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  type: _type = 'caphe_vietnam',
  daysPlanted = 0,
  id,
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
      // Truyền bản sao của position thay vì tham chiếu trực tiếp
      onClick({ 
        id, 
        position: [...treePosClone], 
        daysPlanted, 
        type: _type, 
        status 
      });
    }
  }, [id, treePosClone, daysPlanted, _type, status, onClick]);
  
  // Thêm state để theo dõi trạng thái hover
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerOver = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // Tránh gửi nhiều sự kiện khi đã đang hover
    if (isHovered) return;
    
    // Đánh dấu là đang hover
    setIsHovered(true);
    
    if (onHover) {
      // Truyền bản sao của position thay vì tham chiếu trực tiếp
      onHover({ 
        id, 
        position: [...treePosClone], 
        daysPlanted, 
        type: _type, 
        status 
      }, true);
    }
  }, [id, treePosClone, daysPlanted, _type, status, onHover, isHovered]);
  
  const handlePointerOut = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // Reset trạng thái hover
    setIsHovered(false);
    
    if (onHover) {
      // Truyền bản sao của position thay vì tham chiếu trực tiếp
      onHover({ 
        id, 
        position: [...treePosClone], 
        daysPlanted, 
        type: _type, 
        status 
      }, false);
    }
  }, [id, treePosClone, daysPlanted, _type, status, onHover]);

  const colors = {
    trunk: '#6D4C41',
    leaves: '#1B5E20',
    darkLeaves: '#0A3D10', // lá đậm hơn cho độ sâu
    fruit: '#8B0000', // quả đỏ sẫm
    ripeFruit: '#D41C00', // quả chín đỏ tươi
    unripeFruit: '#006400', // quả xanh
    branches: '#5D4037',
    smallBranches: '#8D6E63' // nhánh nhỏ màu nhạt hơn
  };

  const growthFactor = Math.min(1, daysPlanted / 15);
  const treeScale = 0.7 + growthFactor * 0.3;
  
  // Tạo và lưu trữ giá trị ngẫu nhiên cho cấu trúc cây
  const treeStructure = useMemo(() => {
    // Thông tin các nhánh chính
    const branchDirections = [0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3];
    const branchHeights = [0.5, 0.4, 0.3, 0.5, 0.4, 0.3];
    const branchTilts = [0, Math.PI/12, Math.PI/10, Math.PI/12, Math.PI/10, Math.PI/12];
    
    const mainBranches = branchDirections.map((direction, idx) => {
      const branchLength = 0.7 + Math.random() * 0.3;
      const height = branchHeights[idx];
      const tilt = branchTilts[idx];
      
      // Các nhánh phụ trên mỗi nhánh chính
      const subBranches = [0.3, 0.6, 0.9].map(positionFactor => {
        const smallBranchDir = direction + (Math.random() * Math.PI/2 - Math.PI/4);
        const smallBranchTilt = -Math.PI/6 + Math.random() * Math.PI/3;
        // Sử dụng positionFactor để điều chỉnh chiều dài nhánh
        const smallBranchLength = 0.25 + Math.random() * 0.15 * positionFactor;
        
        // Thông tin lá trên nhánh phụ
        const leaves = [1, 2, 3].map(() => {
          const leafDir = smallBranchDir + (Math.random() * Math.PI - Math.PI/2);
          const leafDist = 0.1 + Math.random() * 0.05;
          const leafHeight = Math.random() * 0.05; // Thêm biến này để lưu trữ chiều cao ngẫu nhiên
          const rotX = Math.random() * Math.PI/6;
          const rotZ = Math.random() * Math.PI/6;
          const isLightLeaf = Math.random() > 0.3;
          
          return {
            leafDir,
            leafDist,
            leafHeight,
            rotation: [rotX, leafDir, rotZ] as [number, number, number],
            isLightLeaf
          };
        });
        
        // Thông tin quả
        const hasFruit = daysPlanted >= 5 && Math.random() > 0.5;
        
        return {
          smallBranchDir,
          smallBranchTilt,
          smallBranchLength,
          leaves,
          hasFruit
        };
      });
      
      return {
        direction,
        height,
        tilt,
        branchLength,
        subBranches
      };
    });
    
    // Lá rơi dưới gốc cây
    const fallenLeaves = daysPlanted > 10 ? [1, 2, 3].map(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.3 + Math.random() * 0.2;
      const rotX = -Math.PI/2 + (Math.random() * 0.2 - 0.1);
      const rotY = Math.random() * Math.PI * 2;
      
      return {
        angle,
        distance,
        rotation: [rotX, rotY, 0] as [number, number, number]
      };
    }) : [];
    
    return {
      mainBranches,
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
      {/* Thân cây cà phê */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.8} />
      </mesh>
      
      {/* Phần gốc cây mở rộng */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>

      {/* 6 Nhánh chính theo các hướng khác nhau - sử dụng giá trị từ treeStructure */}
      {treeStructure.mainBranches.map((branch, idx) => {
        const branchY = 0.9 + branch.height;
        
        return (
          <group key={`main-branch-${idx}`}>
            {/* Nhánh chính */}
            <mesh 
              castShadow 
              position={[0, branchY, 0]} 
              rotation={[branch.tilt, branch.direction, 0]}
            >
              <cylinderGeometry args={[0.05, 0.08, branch.branchLength, 5]} />
              <meshStandardMaterial color={colors.branches} roughness={0.7} />
            </mesh>
            
            {/* Tán lá trên mỗi nhánh chính */}
            <mesh 
              castShadow 
              position={[ 
                Math.sin(branch.direction) * (branch.branchLength/2) * Math.cos(branch.tilt),
                branchY + (branch.branchLength/2) * Math.sin(branch.tilt),
                Math.cos(branch.direction) * (branch.branchLength/2) * Math.cos(branch.tilt)
              ]}
              rotation={[0, branch.direction, 0]}
            >
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color={colors.leaves} roughness={0.6} />
            </mesh>
            
            {/* 2-3 nhánh nhỏ trên mỗi nhánh chính - sử dụng giá trị từ treeStructure */}
            {branch.subBranches.map((subBranch, subIdx) => {
              // Vị trí gốc của nhánh nhỏ trên nhánh chính
              const origin = {
                x: Math.sin(branch.direction) * (branch.branchLength * [0.3, 0.6, 0.9][subIdx]) * Math.cos(branch.tilt),
                y: branchY + (branch.branchLength * [0.3, 0.6, 0.9][subIdx]) * Math.sin(branch.tilt),
                z: Math.cos(branch.direction) * (branch.branchLength * [0.3, 0.6, 0.9][subIdx]) * Math.cos(branch.tilt)
              };
              
              return (
                <group key={`sub-branch-${idx}-${subIdx}`}>
                  {/* Nhánh nhỏ */}
                  <mesh 
                    castShadow 
                    position={[origin.x, origin.y, origin.z]} 
                    rotation={[subBranch.smallBranchTilt, subBranch.smallBranchDir, 0]}
                  >
                    <cylinderGeometry args={[0.02, 0.03, subBranch.smallBranchLength, 4]} />
                    <meshStandardMaterial color={colors.smallBranches} roughness={0.6} />
                  </mesh>
                  
                  {/* Tán lá nhỏ trên nhánh nhỏ */}
                  <mesh 
                    castShadow 
                    position={[ 
                      origin.x + Math.sin(subBranch.smallBranchDir) * (subBranch.smallBranchLength/2) * Math.cos(subBranch.smallBranchTilt),
                      origin.y + (subBranch.smallBranchLength/2) * Math.sin(subBranch.smallBranchTilt),
                      origin.z + Math.cos(subBranch.smallBranchDir) * (subBranch.smallBranchLength/2) * Math.cos(subBranch.smallBranchTilt)
                    ]}
                  >
                    <sphereGeometry args={[0.12, 6, 6]} />
                    <meshStandardMaterial color={colors.leaves} roughness={0.6} />
                  </mesh>
                  
                  {/* Chi tiết lá - sử dụng giá trị từ treeStructure */}
                  {subBranch.leaves.map((leaf, leafIdx) => (
                    <mesh 
                      key={`leaf-${idx}-${subIdx}-${leafIdx}`}
                      castShadow 
                      position={[ 
                        origin.x + Math.sin(subBranch.smallBranchDir) * subBranch.smallBranchLength * 0.8 * Math.cos(subBranch.smallBranchTilt) + Math.sin(leaf.leafDir) * leaf.leafDist,
                        origin.y + subBranch.smallBranchLength * 0.8 * Math.sin(subBranch.smallBranchTilt) + leaf.leafHeight,
                        origin.z + Math.cos(subBranch.smallBranchDir) * subBranch.smallBranchLength * 0.8 * Math.cos(subBranch.smallBranchTilt) + Math.cos(leaf.leafDir) * leaf.leafDist
                      ]}
                      rotation={leaf.rotation}
                    >
                      <boxGeometry args={[0.12, 0.01, 0.05]} />
                      <meshStandardMaterial 
                        color={leaf.isLightLeaf ? colors.darkLeaves : colors.leaves} 
                        roughness={0.6} 
                      />
                    </mesh>
                  ))}
                  
                  {/* Quả cà phê trên nhánh nhỏ - chỉ hiện khi đủ điều kiện */}
                  {subBranch.hasFruit && (
                    <mesh 
                      castShadow 
                      position={[ 
                        origin.x + Math.sin(subBranch.smallBranchDir) * subBranch.smallBranchLength * 0.7 * Math.cos(subBranch.smallBranchTilt),
                        origin.y + subBranch.smallBranchLength * 0.6 * Math.sin(subBranch.smallBranchTilt) - 0.03,
                        origin.z + Math.cos(subBranch.smallBranchDir) * subBranch.smallBranchLength * 0.7 * Math.cos(subBranch.smallBranchTilt)
                      ]}
                    >
                      <sphereGeometry args={[0.03 + Math.random() * 0.01, 6, 6]} />
                      <meshStandardMaterial 
                        color={daysPlanted > 10 ? colors.ripeFruit : 
                              daysPlanted > 7 ? colors.fruit :
                              colors.unripeFruit} 
                        roughness={0.5} 
                      />
                    </mesh>
                  )}
                </group>
              )
            })}
          </group>
        )
      })}
      
      {/* Thêm một vài lá rơi xuống gần gốc cây - sử dụng giá trị từ treeStructure */}
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
          <boxGeometry args={[0.12, 0.01, 0.05]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export const CoffeeTrees: React.FC<CoffeeTreesProps> = ({ trees, onTreeClick, onTreeHover }) => {
  return (
    <group>
      {trees.map((tree) => {
        // Tạo bản sao của position cho mỗi cây
        const treePosition: [number, number, number] = [...tree.position] as [number, number, number];
        
        return (
          <CoffeeTree
            key={`coffee-${tree.id}`}
            id={tree.id}
            position={treePosition}
            rotation={tree.rotation}
            scale={tree.scale}
            type={tree.type as CoffeeTreeType}
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

interface CoffeeTreesProps {
  trees: Array<{
    id: string;
    type: string;
    daysPlanted: number;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    status?: string;
  }>;
  onTreeClick?: (info: TreeInfo) => void;
  onTreeHover?: (info: TreeInfo, isHovering: boolean) => void;
}

export default CoffeeTree;