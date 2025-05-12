
import React, { useRef, useEffect, useCallback, memo } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { CameraPosition } from '../../../components/controls/CameraController'

// Add camera controller interface to window
declare global {
  interface Window {
    farmCameraController?: {
      goToView: (viewId: string) => void;
      getCurrentView: () => string;
      isTransitioning: () => boolean;
      getViewpoints: () => CameraPosition[];
      resetControls: () => void;
    };
  }
}

// Preload model - sẽ chỉ tải một lần
useGLTF.preload('/models/farmhouse.glb');

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh;
    Object_3: THREE.Mesh;
    Object_4: THREE.Mesh;
    Object_5: THREE.Mesh;
    Object_6: THREE.Mesh;
    Object_7: THREE.Mesh;
    Object_8: THREE.Mesh;
    Object_9: THREE.Mesh;
    Object_10: THREE.Mesh;
    Object_11: THREE.Mesh;
    Object_12: THREE.Mesh;
    Object_13: THREE.Mesh;
    Object_14: THREE.Mesh;
  };
  materials: {
    Charcoal: THREE.Material;
    'Color_-_Dark': THREE.Material;
    Concrete: THREE.Material;
    Glass__Standard: THREE.Material;
    'Color_-_White': THREE.Material;
    Drywall: THREE.Material;
    Fir_Framing: THREE.Material;
    Fir_Stud_16_OC: THREE.Material;
    Grey_Standing_Se: THREE.Material;
    Housewrap: THREE.Material;
    Tuscan_Villa_Rom: THREE.Material;
    'OSB-Hrz': THREE.Material;
    'Walnut_-_Dark': THREE.Material;
  };
}

interface FarmHouseProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  onClick?: (event: ThreeEvent<MouseEvent>) => void
}

const FarmHouse: React.FC<FarmHouseProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  onClick
}) => {  // Sử dụng ref để tham chiếu trực tiếp đến đối tượng Three.js cho tối ưu
  const groupRef = useRef<THREE.Group>(null)
  // Load model với mã JSX được tạo bởi gltfjsx
  // Lưu ý: Đường dẫn có thể cần thay đổi tùy thuộc vào vị trí thực tế của file trong thư mục public  // Load model với options mặc định, vẫn có thể chia sẻ geometry giữa các instance
  const { nodes, materials } = useGLTF('/models/farmhouse.glb') as unknown as GLTFResult

  // Xử lý sự kiện click - chuyển camera đến viewpoint nhà
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (onClick) {
        onClick(e)
      }
      
      // Di chuyển camera đến vị trí nhà
      if (window.farmCameraController) {
        window.farmCameraController.goToView('house');
      }    },
    [onClick]
  );
  
  // Sử dụng useEffect để tối ưu hiệu suất dựa trên khoảng cách từ camera
  useEffect(() => {
    // Đảm bảo ref đã được gán
    if (!groupRef.current) return;
    
    // Lấy khoảng cách từ camera để áp dụng tối ưu hóa
    const distanceFromCenter = Math.sqrt(
      position[0] * position[0] + position[2] * position[2]
    );
    
    // Tối ưu cơ bản: Tối ưu chất lượng bóng cho các đối tượng
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Thiết lập shadow dựa trên khoảng cách
        // Chỉ những ngôi nhà gần camera mới casting shadow
        if (distanceFromCenter < 10) {
          child.castShadow = true;
          child.receiveShadow = true;
        } else {
          // Nhà xa không cast shadow để tăng hiệu suất
          child.castShadow = false;
          child.receiveShadow = true;
        }
        
        // Giảm độ phức tạp của bóng
        if (child.material) {
          child.material.shadowSide = THREE.FrontSide;
          
          // Dùng chung material cho các instance giống nhau
          if (typeof child.material.name === 'string' && child.material.name) {
            child.material.precision = 'lowp'; // Giảm độ chính xác tính toán cho vật thể xa
          }
        }
      }
    });
    
    return () => {
      // Dọn dẹp khi component unmount
    };  }, [position]); // Khi position thay đổi, cần tính toán lại tối ưu hóa
  
  // Đơn giản hóa - không có hiệu ứng hover
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      dispose={null}
    >{/* Xoay nhà để đứng thẳng với đáy ở dưới đất */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2?.geometry}
          material={materials.Charcoal}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_3?.geometry}
          material={materials['Color_-_Dark']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4?.geometry}
          material={materials.Concrete}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5?.geometry}
          material={materials.Glass__Standard}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_6?.geometry}
          material={materials['Color_-_White']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_7?.geometry}
          material={materials.Drywall}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_8?.geometry}
          material={materials.Fir_Framing}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_9?.geometry}
          material={materials.Fir_Stud_16_OC}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_10?.geometry}
          material={materials.Grey_Standing_Se}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_11?.geometry}
          material={materials.Housewrap}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_12?.geometry}
          material={materials.Tuscan_Villa_Rom}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_13?.geometry}
          material={materials['OSB-Hrz']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_14?.geometry}
          material={materials['Walnut_-_Dark']}
        />
      </group>
    </group>
  )
}

export default memo(FarmHouse);
