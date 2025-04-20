import React, { useRef } from 'react';
import * as THREE from 'three';

// Loại cây cà phê và các loại cây khác có thể thêm sau này
export type CoffeeTreeType = 'caphe_vietnam' | 'caphe_arabica' | 'caphe_robusta';

interface CoffeeTreeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type?: CoffeeTreeType;
  daysPlanted?: number;
  id?: string;
}

const CoffeeTree: React.FC<CoffeeTreeProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  type = 'coffee-tree',
  daysPlanted = 0,
  id
}) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Màu sắc cho cây cà phê
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

  // Xử lý chuyển đổi ngày trồng thành kích thước
  const growthFactor = Math.min(1, daysPlanted / 15); // Tối đa 100% sau 15 ngày
  const treeScale = 0.7 + growthFactor * 0.3; // Scale từ 70% đến 100%

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale * treeScale, scale * treeScale, scale * treeScale]}
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

      {/* 6 Nhánh chính theo các hướng khác nhau */}
      {[
        // Hướng, cao thấp, góc nghiêng
        [0, 0.5, 0], // Thẳng (0 độ)
        [Math.PI/3, 0.4, Math.PI/12], // 60 độ
        [2*Math.PI/3, 0.3, Math.PI/10], // 120 độ
        [Math.PI, 0.5, Math.PI/12], // 180 độ
        [4*Math.PI/3, 0.4, Math.PI/10], // 240 độ
        [5*Math.PI/3, 0.3, Math.PI/12], // 300 độ
      ].map((params, idx) => {
        const [direction, height, tilt] = params;
        const branchLength = 0.7 + Math.random() * 0.3; // Chiều dài ngẫu nhiên
        const branchY = 0.9 + height;
        
        return (
          <group key={`main-branch-${idx}`}>
            {/* Nhánh chính */}
            <mesh 
              castShadow 
              position={[0, branchY, 0]} 
              rotation={[tilt, direction, 0]}
            >
              <cylinderGeometry args={[0.05, 0.08, branchLength, 5]} />
              <meshStandardMaterial color={colors.branches} roughness={0.7} />
            </mesh>
            
            {/* Tán lá trên mỗi nhánh chính */}
            <mesh 
              castShadow 
              position={[
                Math.sin(direction) * (branchLength/2) * Math.cos(tilt),
                branchY + (branchLength/2) * Math.sin(tilt),
                Math.cos(direction) * (branchLength/2) * Math.cos(tilt)
              ]}
              rotation={[0, direction, 0]}
            >
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color={colors.leaves} roughness={0.6} />
            </mesh>
            
            {/* 2-3 nhánh nhỏ trên mỗi nhánh chính */}
            {[0.3, 0.6, 0.9].map((pos, subIdx) => {
              const smallBranchDir = direction + (Math.random() * Math.PI/2 - Math.PI/4);
              const smallBranchTilt = -Math.PI/6 + Math.random() * Math.PI/3;
              const smallBranchLength = 0.25 + Math.random() * 0.15;
              
              // Vị trí gốc của nhánh nhỏ trên nhánh chính
              const origin = {
                x: Math.sin(direction) * (branchLength * pos) * Math.cos(tilt),
                y: branchY + (branchLength * pos) * Math.sin(tilt),
                z: Math.cos(direction) * (branchLength * pos) * Math.cos(tilt)
              };
              
              return (
                <group key={`sub-branch-${idx}-${subIdx}`}>
                  {/* Nhánh nhỏ */}
                  <mesh 
                    castShadow 
                    position={[origin.x, origin.y, origin.z]} 
                    rotation={[smallBranchTilt, smallBranchDir, 0]}
                  >
                    <cylinderGeometry args={[0.02, 0.03, smallBranchLength, 4]} />
                    <meshStandardMaterial color={colors.smallBranches} roughness={0.6} />
                  </mesh>
                  
                  {/* Tán lá nhỏ trên nhánh nhỏ */}
                  <mesh 
                    castShadow 
                    position={[
                      origin.x + Math.sin(smallBranchDir) * (smallBranchLength/2) * Math.cos(smallBranchTilt),
                      origin.y + (smallBranchLength/2) * Math.sin(smallBranchTilt),
                      origin.z + Math.cos(smallBranchDir) * (smallBranchLength/2) * Math.cos(smallBranchTilt)
                    ]}
                  >
                    <sphereGeometry args={[0.12, 6, 6]} />
                    <meshStandardMaterial color={colors.leaves} roughness={0.6} />
                  </mesh>
                  
                  {/* Chi tiết lá (2-3 lá trên mỗi nhánh nhỏ) */}
                  {[1, 2, 3].map((_, leafIdx) => {
                    const leafDir = smallBranchDir + (Math.random() * Math.PI - Math.PI/2);
                    const leafDist = 0.1 + Math.random() * 0.05;
                    
                    return (
                      <mesh 
                        key={`leaf-${idx}-${subIdx}-${leafIdx}`}
                        castShadow 
                        position={[
                          origin.x + Math.sin(smallBranchDir) * smallBranchLength * 0.8 * Math.cos(smallBranchTilt) + Math.sin(leafDir) * leafDist,
                          origin.y + smallBranchLength * 0.8 * Math.sin(smallBranchTilt) + (Math.random() * 0.05),
                          origin.z + Math.cos(smallBranchDir) * smallBranchLength * 0.8 * Math.cos(smallBranchTilt) + Math.cos(leafDir) * leafDist
                        ]}
                        rotation={[
                          Math.random() * Math.PI/6,
                          leafDir,
                          Math.random() * Math.PI/6
                        ]}
                      >
                        <boxGeometry args={[0.12, 0.01, 0.05]} />
                        <meshStandardMaterial 
                          color={Math.random() > 0.3 ? colors.leaves : colors.darkLeaves} 
                          roughness={0.6} 
                        />
                      </mesh>
                    )
                  })}
                  
                  {/* Quả cà phê trên nhánh nhỏ (nếu cây đủ già) */}
                  {daysPlanted >= 5 && Math.random() > 0.5 && (
                    <mesh 
                      castShadow 
                      position={[
                        origin.x + Math.sin(smallBranchDir) * smallBranchLength * 0.7 * Math.cos(smallBranchTilt),
                        origin.y + smallBranchLength * 0.6 * Math.sin(smallBranchTilt) - 0.03,
                        origin.z + Math.cos(smallBranchDir) * smallBranchLength * 0.7 * Math.cos(smallBranchTilt)
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
      
      {/* Thêm một vài lá rơi xuống gần gốc cây */}
      {daysPlanted > 10 && [1, 2, 3].map((_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.3 + Math.random() * 0.2;
        
        return (
          <mesh 
            key={`fallen-leaf-${idx}`}
            position={[
              Math.sin(angle) * distance,
              0.01,
              Math.cos(angle) * distance
            ]}
            rotation={[
              -Math.PI/2 + (Math.random() * 0.2 - 0.1),
              Math.random() * Math.PI * 2,
              0
            ]}
          >
            <boxGeometry args={[0.12, 0.01, 0.05]} />
            <meshStandardMaterial color="#5D4037" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  );
};

// Component để render nhiều cây cà phê từ dữ liệu
interface CoffeeTreesProps {
  trees: Array<{
    id: string;
    type?: CoffeeTreeType;
    daysPlanted: number;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
  }>;
}

export const CoffeeTrees: React.FC<CoffeeTreesProps> = ({ trees }) => {
  return (
    <group>
      {trees.map((tree) => (
        <CoffeeTree
          key={tree.id}
          id={tree.id}
          position={tree.position}
          rotation={tree.rotation}
          scale={tree.scale}
          type={tree.type as CoffeeTreeType || 'coffee-tree '}
          daysPlanted={tree.daysPlanted}
        />
      ))}
    </group>
  );
};

export default CoffeeTree;