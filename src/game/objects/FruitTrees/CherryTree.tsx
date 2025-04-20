import React, { useRef } from 'react';
import * as THREE from 'three';

interface CherryTreeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  daysPlanted?: number;
  id?: string;
}

const CherryTree: React.FC<CherryTreeProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  daysPlanted = 0,
  id: _id 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Màu sắc cho cây cherry
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

  // Xử lý tỷ lệ dựa trên thời gian trồng
  const growthFactor = Math.min(1, daysPlanted / 12); // Tối đa 100% sau 12 ngày
  const treeScale = 0.6 + growthFactor * 0.4; // Scale từ 60% đến 100%

  // Xác định có nở hoa và có quả không
  const hasBlossoms = daysPlanted >= 3 && daysPlanted < 7;
  const hasFruits = daysPlanted >= 7;
  const hasMatureFruits = daysPlanted >= 10;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale * treeScale, scale * treeScale, scale * treeScale]}
    >
      {/* Thân cây */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 1.0, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>

      {/* Phần gốc cây */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>

      {/* Phần thân trên phân nhánh */}
      <mesh castShadow position={[0, 1.1, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.07, 0.12, 0.5, 6]} />
        <meshStandardMaterial color={colors.branches} roughness={0.8} />
      </mesh>
      
      <mesh castShadow position={[0, 1.1, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.07, 0.12, 0.5, 6]} />
        <meshStandardMaterial color={colors.branches} roughness={0.8} />
      </mesh>

      {/* Nhánh chính */}
      {[
        // [hướng quay, độ cao, độ nghiêng ngang]
        [0, 1.0, 0.05],
        [Math.PI/4, 0.9, 0.1],
        [Math.PI/2, 1.0, 0.07],
        [3*Math.PI/4, 0.95, 0.1],
        [Math.PI, 1.0, 0.05],
        [5*Math.PI/4, 0.9, 0.1],
        [3*Math.PI/2, 1.0, 0.07],
        [7*Math.PI/4, 0.95, 0.1]
      ].map((params, idx) => {
        const [angle, height, tilt] = params;
        const branchLength = 0.5 + Math.random() * 0.3;
        const branchY = 0.9 + height * growthFactor;

        return (
          <group key={`branch-${idx}`}>
            {/* Nhánh chính */}
            <mesh castShadow 
              position={[0, branchY, 0]} 
              rotation={[tilt, angle, Math.random() * 0.1]}
            >
              <cylinderGeometry args={[0.04, 0.06, branchLength, 5]} />
              <meshStandardMaterial color={colors.branches} roughness={0.7} />
            </mesh>

            {/* Tán lá chính */}
            <mesh castShadow
              position={[
                Math.sin(angle) * (branchLength * 0.7),
                branchY + 0.2,
                Math.cos(angle) * (branchLength * 0.7)
              ]}
            >
              <sphereGeometry args={[0.25 + Math.random() * 0.1, 8, 8]} />
              <meshStandardMaterial 
                color={Math.random() > 0.5 ? colors.leaves : colors.lightLeaves} 
                roughness={0.7} 
              />
            </mesh>

            {/* Nhánh nhỏ và lá */}
            {[0.4, 0.7, 1.0].map((pos, subIdx) => {
              const subAngle = angle + (Math.random() * 0.5 - 0.25);
              const _subTilt = tilt + (Math.random() * 0.3 - 0.15); // Đổi thành _subTilt để tránh warning về việc không sử dụng
              const origin = {
                x: Math.sin(angle) * (branchLength * pos),
                y: branchY + tilt * pos * 2,
                z: Math.cos(angle) * (branchLength * pos)
              };

              return (
                <group key={`subbranch-${idx}-${subIdx}`}>
                  {/* Các chùm quả cherry (2-4 quả mỗi chùm) */}
                  {hasFruits && Math.random() > 0.4 && (
                    <group position={[origin.x, origin.y - 0.1, origin.z]}>
                      {/* Cuống quả */}
                      <mesh castShadow position={[0, 0.05, 0]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.1, 4]} />
                        <meshStandardMaterial color="#654321" roughness={0.5} />
                      </mesh>

                      {/* 2-4 quả cherry */}
                      {Array.from({length: 2 + Math.floor(Math.random() * 3)}).map((_, cherryIdx) => {
                        const cherryOffset = [
                          (Math.random() * 0.08 - 0.04),
                          -0.05 - (Math.random() * 0.02),
                          (Math.random() * 0.08 - 0.04)
                        ];
                        
                        return (
                          <mesh 
                            key={`cherry-${idx}-${subIdx}-${cherryIdx}`} 
                            castShadow 
                            position={cherryOffset as [number, number, number]}
                          >
                            <sphereGeometry args={[0.04, 6, 6]} />
                            <meshStandardMaterial 
                              color={hasMatureFruits ? colors.ripeCherries : colors.cherries} 
                              roughness={0.3} 
                              metalness={0.1}
                            />
                          </mesh>
                        );
                      })}
                    </group>
                  )}

                  {/* Hoa cherry (khi cây đang ở giai đoạn nở hoa) */}
                  {hasBlossoms && !hasFruits && Math.random() > 0.3 && (
                    <group position={[origin.x, origin.y, origin.z]}>
                      {/* Nhóm 3-5 hoa nhỏ */}
                      {Array.from({length: 3 + Math.floor(Math.random() * 3)}).map((_, flowerIdx) => {
                        const flowerOffset = [
                          (Math.random() * 0.1 - 0.05),
                          (Math.random() * 0.06),
                          (Math.random() * 0.1 - 0.05)
                        ];
                        
                        return (
                          <mesh 
                            key={`blossom-${idx}-${subIdx}-${flowerIdx}`} 
                            castShadow 
                            position={flowerOffset as [number, number, number]}
                          >
                            <sphereGeometry args={[0.03, 6, 6]} />
                            <meshStandardMaterial color={colors.blossoms} roughness={0.5} />
                          </mesh>
                        );
                      })}
                    </group>
                  )}

                  {/* Tán lá nhỏ */}
                  <mesh 
                    castShadow
                    position={[origin.x, origin.y, origin.z]}
                  >
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshStandardMaterial color={colors.leaves} roughness={0.7} />
                  </mesh>

                  {/* Chi tiết lá */}
                  {[1, 2, 3].map((_, leafIdx) => {
                    const leafAngle = subAngle + (Math.random() * Math.PI - Math.PI/2);
                    const dist = 0.1 + Math.random() * 0.05;
                    
                    return (
                      <mesh 
                        key={`leaf-${idx}-${subIdx}-${leafIdx}`}
                        castShadow
                        position={[
                          origin.x + Math.sin(leafAngle) * dist,
                          origin.y + Math.random() * 0.08,
                          origin.z + Math.cos(leafAngle) * dist
                        ]}
                        rotation={[
                          Math.random() * 0.5 - 0.25,
                          leafAngle,
                          Math.random() * 0.5 - 0.25
                        ]}
                      >
                        <planeGeometry args={[0.08, 0.12]} />
                        <meshStandardMaterial 
                          color={Math.random() > 0.3 ? colors.leaves : colors.lightLeaves} 
                          side={THREE.DoubleSide}
                          roughness={0.7}
                        />
                      </mesh>
                    )
                  })}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Lá rơi dưới gốc cây */}
      {daysPlanted > 8 && [1, 2, 3].map((_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.2 + Math.random() * 0.3;
        
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
            <planeGeometry args={[0.1, 0.15]} />
            <meshStandardMaterial 
              color="#A0522D" 
              side={THREE.DoubleSide}
              roughness={0.9} 
            />
          </mesh>
        )
      })}
    </group>
  );
};

// Component để render nhiều cây cherry từ dữ liệu
interface CherryTreesProps {
  trees: Array<{
    id: string;
    daysPlanted: number;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
  }>;
}

export const CherryTrees: React.FC<CherryTreesProps> = ({ trees }) => {
  return (
    <group>
      {trees.map((tree) => (
        <CherryTree
          key={tree.id}
          id={tree.id}
          position={tree.position}
          rotation={tree.rotation}
          scale={tree.scale}
          daysPlanted={tree.daysPlanted}
        />
      ))}
    </group>
  );
};

export default CherryTree;