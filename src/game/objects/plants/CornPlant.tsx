// Tạo bởi https://github.com/pmndrs/gltfjsx và được điều chỉnh
import React, { useRef, useCallback, useMemo, memo } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { TreeInfo } from '../../types'
import { GLTF } from 'three-stdlib'

// ========= THÔNG TIN PHƯƠNG PHÁP TẢI MODEL =========
// Phương pháp: CODE GLTFJSX - Model được tách sẵn thành các mesh riêng biệt
// Ưu điểm: Hiệu năng tốt hơn, tải model nhanh hơn
// Cách nhận biết: 
// - Sử dụng useGLTF thay vì useLoader/useModelLoader
// - Hiển thị từng mesh riêng biệt (<mesh/>) thay vì <primitive/>
// - Preload model để tối ưu hiệu suất
// ===================================================

// Preload model - sẽ chỉ tải một lần
useGLTF.preload('/models/Corn_plant.glb');

type GLTFResult = GLTF & {
  nodes: {
    defaultMaterial: THREE.Mesh
    defaultMaterial_1: THREE.Mesh
    defaultMaterial_2: THREE.Mesh
    defaultMaterial_3: THREE.Mesh
    defaultMaterial_4: THREE.Mesh
    defaultMaterial_5: THREE.Mesh
    defaultMaterial_6: THREE.Mesh
    defaultMaterial_7: THREE.Mesh
    defaultMaterial_8: THREE.Mesh
    defaultMaterial_9: THREE.Mesh
    defaultMaterial_10: THREE.Mesh
    defaultMaterial_11: THREE.Mesh
    defaultMaterial_12: THREE.Mesh
    defaultMaterial_13: THREE.Mesh
    defaultMaterial_14: THREE.Mesh
    defaultMaterial_15: THREE.Mesh
    defaultMaterial_16: THREE.Mesh
    defaultMaterial_17: THREE.Mesh
    defaultMaterial_18: THREE.Mesh
    defaultMaterial_19: THREE.Mesh
    defaultMaterial_20: THREE.Mesh
    defaultMaterial_21: THREE.Mesh
    defaultMaterial_22: THREE.Mesh
    defaultMaterial_23: THREE.Mesh
    defaultMaterial_24: THREE.Mesh
    defaultMaterial_25: THREE.Mesh
    defaultMaterial_26: THREE.Mesh
    defaultMaterial_27: THREE.Mesh
    defaultMaterial_28: THREE.Mesh
    defaultMaterial_29: THREE.Mesh
    defaultMaterial_30: THREE.Mesh
    defaultMaterial_31: THREE.Mesh
    defaultMaterial_32: THREE.Mesh
    defaultMaterial_33: THREE.Mesh
    defaultMaterial_34: THREE.Mesh
    defaultMaterial_35: THREE.Mesh
    defaultMaterial_36: THREE.Mesh
    defaultMaterial_37: THREE.Mesh
    defaultMaterial_38: THREE.Mesh
    defaultMaterial_39: THREE.Mesh
    defaultMaterial_40: THREE.Mesh
    defaultMaterial_41: THREE.Mesh
  }
  materials: {
    Maize: THREE.Material
    Maize_2: THREE.Material
    Maize_alpha: THREE.Material
  }
}

interface CornPlantProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  daysPlanted?: number
  id?: string
  onClick?: (info: TreeInfo) => void
  onHover?: (info: TreeInfo, isHovering: boolean) => void
  status?: string
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
  // Tính toán cho tương tác
  const groupRef = useRef<THREE.Group>(null)
  const plantPosClone = useMemo<[number, number, number]>(
    () => [position[0], position[1], position[2]],
    [position]
  )
  const [isHovered, setIsHovered] = React.useState(false)

  // Load model với mã JSX được tạo bởi gltfjsx
  // Sửa lỗi type casting - chuyển đổi an toàn bằng cách sử dụng as unknown trước
  const { nodes, materials } = useGLTF('/models/Corn_plant.glb') as unknown as GLTFResult

  // Tính toán hệ số tăng trưởng dựa trên số ngày đã trồng
  const growthFactor = Math.min(1, daysPlanted / 14)
  const finalScale = scale * growthFactor

  // Xử lý sự kiện click
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (onClick) {
        onClick({ id: _id, position: [...plantPosClone], daysPlanted, type: 'corn', status })
      }
    },
    [_id, plantPosClone, daysPlanted, status, onClick]
  )

  // Xử lý sự kiện hover
  const handlePointerOver = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (isHovered) return
      setIsHovered(true)
      if (onHover) {
        onHover({ id: _id, position: [...plantPosClone], daysPlanted, type: 'corn', status }, true)
      }
    },
    [_id, plantPosClone, daysPlanted, status, onHover, isHovered]
  )

  const handlePointerOut = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      setIsHovered(false)
      if (onHover) {
        onHover({ id: _id, position: [...plantPosClone], daysPlanted, type: 'corn', status }, false)
      }
    },
    [_id, plantPosClone, daysPlanted, status, onHover]
  )

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={finalScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      dispose={null}
    >
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.009}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          {/* Phần gốc cây - luôn hiển thị */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial?.geometry}
            material={materials.Maize_2}
            position={[0.936, -3.123, 0.376]}
            rotation={[-Math.PI / 2, 0, -1.9]}
            scale={0.791}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_1?.geometry}
            material={materials.Maize_2}
            position={[-0.734, -3.123, -0.385]}
            rotation={[-Math.PI / 2, 0, 2.59]}
            scale={0.791}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_2?.geometry}
            material={materials.Maize_2}
            position={[-0.474, -3.123, 1.537]}
            rotation={[-Math.PI / 2, 0, -2.539]}
            scale={0.791}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_5?.geometry}
            material={materials.Maize_2}
            position={[1.012, -3.123, -0.118]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.791}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_6?.geometry}
            material={materials.Maize_2}
            position={[-0.81, -3.123, 0.109]}
            rotation={[-Math.PI / 2, 0, 1.794]}
            scale={0.791}
          />

          {/* Phần thân cây - luôn hiển thị */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_12?.geometry}
            material={materials.Maize}
            position={[0.089, 35.749, -0.123]}
            rotation={[-Math.PI / 2, 0, 1.437]}
            scale={3.025}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_13?.geometry}
            material={materials.Maize}
            position={[0.089, 45.624, -0.123]}
            rotation={[-Math.PI / 2, 0, -3.072]}
            scale={3.025}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_14?.geometry}
            material={materials.Maize}
            position={[0.089, 52.889, -0.123]}
            rotation={[-Math.PI / 2, 0, -1.602]}
            scale={3.266}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_15?.geometry}
            material={materials.Maize}
            position={[0.089, 27.081, -0.123]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={3.025}
          />

          {/* Phần giữa cây - hiển thị khi cây phát triển ít nhất 40% */}
          {growthFactor >= 0.4 && (
            <>
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_38?.geometry}
                material={materials.Maize}
                position={[0.089, 93.719, -0.123]}
                rotation={[-Math.PI / 2, 0, -1.094]}
                scale={4.071}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_39?.geometry}
                material={materials.Maize}
                position={[0.089, 103.595, -0.123]}
                rotation={[-Math.PI / 2, 0, 0.68]}
                scale={4.071}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_40?.geometry}
                material={materials.Maize}
                position={[0.089, 110.86, -0.123]}
                rotation={[-Math.PI / 2, 0, 2.15]}
                scale={4.071}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_41?.geometry}
                material={materials.Maize}
                position={[0.089, 85.052, -0.123]}
                rotation={[-Math.PI / 2, 0, -2.531]}
                scale={4.071}
              />
            </>
          )}

          {/* Phần trên cây - hiển thị khi cây phát triển ít nhất 70% */}
          {growthFactor >= 0.7 && (
            <>
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_34?.geometry}
                material={materials.Maize}
                position={[0.089, 149.331, -0.123]}
                rotation={[-Math.PI / 2, 0, 2.92]}
                scale={4.071}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_35?.geometry}
                material={materials.Maize}
                position={[0.089, 159.206, -0.123]}
                rotation={[-Math.PI / 2, 0, -1.589]}
                scale={4.071}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_36?.geometry}
                material={materials.Maize}
                position={[0.089, 166.471, -0.123]}
                rotation={[-Math.PI / 2, 0, -0.119]}
                scale={4.071}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_37?.geometry}
                material={materials.Maize}
                position={[0.089, 140.663, -0.123]}
                rotation={[-Math.PI / 2, 0, 1.484]}
                scale={4.071}

              />

              {/* Phần bắp ngô */}
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_7?.geometry}
                material={materials.Maize_alpha}
                position={[12.949, 122.034, -3.305]}
                rotation={[-1.611, 0.332, -0.001]}
                scale={0.271}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_8?.geometry}
                material={materials.Maize_2}
                position={[6.848, 104.84, -1.966]}
                rotation={[-1.643, 0.342, 0.003]}
                scale={0.791}
              />
            </>
          )}

          {/* Phần ngọn cây và lá - hiển thị khi cây phát triển đủ 100% */}
          {growthFactor >= 1.0 && (
            <>
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_3?.geometry}
                material={materials.Maize_alpha}
                position={[-11.897, 172.302, -3.594]}
                rotation={[-1.61, -0.317, -2.718]}
                scale={0.271}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_4?.geometry}
                material={materials.Maize_2}
                position={[-6.335, 154.94, -1.68]}
                rotation={[-1.686, -0.326, 2.586]}
                scale={0.791}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_9?.geometry}
                material={materials.Maize_2}
                position={[0.097, 265.847, -0.018]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.791}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_10?.geometry}
                material={materials.Maize_alpha}
                position={[-0.056, 290.095, 0.106]}
                rotation={[-Math.PI / 2, 0, 0.383]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_11?.geometry}
                material={materials.Maize_alpha}
                position={[-0.056, 290.095, 0.106]}
                rotation={[-Math.PI / 2, 0, 0.383]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_16?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 286.72, -0.123]}
                rotation={[-Math.PI / 2, 0, 2.593]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_17?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 286.72, -0.123]}
                rotation={[-Math.PI / 2, 0, 2.593]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_18?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 287.957, -0.123]}
                rotation={[-Math.PI / 2, 0, -1.13]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_19?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 287.957, -0.123]}
                rotation={[-Math.PI / 2, 0, -1.13]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_20?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 282.524, -0.123]}
                rotation={[-Math.PI / 2, 0, -1.739]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_21?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 282.524, -0.123]}
                rotation={[-Math.PI / 2, 0, -1.739]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_22?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 283.762, -0.123]}
                rotation={[-Math.PI / 2, 0, 0.822]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_23?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 283.762, -0.123]}
                rotation={[-Math.PI / 2, 0, 0.822]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_24?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 281.48, -0.123]}
                rotation={[-Math.PI / 2, 0, -0.056]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_25?.geometry}
                material={materials.Maize_alpha}
                position={[0.089, 281.48, -0.123]}
                rotation={[-Math.PI / 2, 0, -0.056]}
                scale={0.615}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_26?.geometry}
                material={materials.Maize}
                position={[0.089, 244.752, -0.123]}
                rotation={[-Math.PI / 2, 0, -2.403]}
                scale={2.925}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_27?.geometry}
                material={materials.Maize}
                position={[0.089, 254.627, -0.123]}
                rotation={[-Math.PI / 2, 0, -0.629]}
                scale={2.925}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_28?.geometry}
                material={materials.Maize}
                position={[0.089, 261.892, -0.123]}
                rotation={[-Math.PI / 2, 0, 0.841]}
                scale={2.925}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_29?.geometry}
                material={materials.Maize}
                position={[0.089, 236.085, -0.123]}
                rotation={[-Math.PI / 2, 0, 2.443]}
                scale={2.925}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_30?.geometry}
                material={materials.Maize}
                position={[0.089, 201.263, -0.123]}
                rotation={[-Math.PI / 2, 0, -2.403]}
                scale={3.845}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_31?.geometry}
                material={materials.Maize}
                position={[0.089, 211.138, -0.123]}
                rotation={[-Math.PI / 2, 0, -0.629]}
                scale={3.845}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_32?.geometry}
                material={materials.Maize}
                position={[0.089, 218.403, -0.123]}
                rotation={[-Math.PI / 2, 0, 0.841]}
                scale={3.845}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.defaultMaterial_33?.geometry}
                material={materials.Maize}
                position={[0.089, 192.596, -0.123]}
                rotation={[-Math.PI / 2, 0, 2.443]}
                scale={3.845}
              />
            </>
          )}
        </group>
      </group>
    </group>
  )
}

// Component CornPlants không thay đổi
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
