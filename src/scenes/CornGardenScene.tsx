import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CornPlants } from '../game/objects/FruitTrees/CornPlant';
import { TreeInfo } from '../game/types';

// Component con để render nội dung bên trong Canvas
function CornGardenContent() {
  const { scene, camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Thiết lập background và lighting
  useEffect(() => {
    // Màu nền xanh nhạt cho bầu trời
    scene.background = new THREE.Color('#b0e0f7');
    
    // Đặt vị trí ban đầu cho camera
    camera.position.set(0, 5, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    // Thêm ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Thêm directional light (ánh sáng mặt trời)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    
    // Cấu hình shadow cho directional light
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    
    scene.add(dirLight);
    
    return () => {
      scene.remove(ambientLight);
      scene.remove(dirLight);
    };
  }, [scene, camera]);
  
  // Xử lý khi click vào cây ngô
  const handleCornPlantClick = (info: TreeInfo) => {
    console.log('Corn plant clicked:', info);
    // Gửi thông tin cây được chọn ra ngoài thông qua custom event
    window.dispatchEvent(new CustomEvent('corn-plant-selected', { 
      detail: info 
    }));
  };
  
  // Xử lý khi hover qua cây ngô
  const handleCornPlantHover = (info: TreeInfo, isHovering: boolean) => {
    console.log(`Corn plant ${isHovering ? 'hovered' : 'unhovered'}:`, info);
  };
  
  return (
    <>
      {/* Nền phẳng */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#8a7d4e" />
      </mesh>
      
      {/* Tạo một số cây ngô */}
      <CornPlants 
        plants={[
          { id: 'corn1', position: [-5, -0.5, -5], daysPlanted: 14, scale: 0.8, status: 'good' },
          { id: 'corn2', position: [-3, -0.5, -3], daysPlanted: 10, scale: 0.7, status: 'normal' },
          { id: 'corn3', position: [-1, -0.5, -4], daysPlanted: 14, scale: 0.9, status: 'good' },
          { id: 'corn4', position: [1, -0.5, -5], daysPlanted: 12, scale: 0.75, status: 'bad' },
          { id: 'corn5', position: [3, -0.5, -3], daysPlanted: 14, scale: 0.8, status: 'good' },
          { id: 'corn6', position: [5, -0.5, -5], daysPlanted: 14, scale: 0.85, status: 'normal' },
          
          { id: 'corn7', position: [-5, -0.5, -2], daysPlanted: 14, scale: 0.9, status: 'good' },
          { id: 'corn8', position: [-3, -0.5, 0], daysPlanted: 13, scale: 0.8, status: 'bad' },
          { id: 'corn9', position: [-1, -0.5, -1], daysPlanted: 14, scale: 0.9, status: 'good' },
          { id: 'corn10', position: [1, -0.5, -2], daysPlanted: 11, scale: 0.7, status: 'normal' },
          { id: 'corn11', position: [3, -0.5, 0], daysPlanted: 14, scale: 0.8, status: 'good' },
          { id: 'corn12', position: [5, -0.5, -2], daysPlanted: 14, scale: 0.85, status: 'bad' },
          
          { id: 'corn13', position: [-5, -0.5, 1], daysPlanted: 14, scale: 0.8, status: 'normal' },
          { id: 'corn14', position: [-3, -0.5, 3], daysPlanted: 12, scale: 0.75, status: 'good' },
          { id: 'corn15', position: [-1, -0.5, 2], daysPlanted: 14, scale: 0.9, status: 'bad' },
          { id: 'corn16', position: [1, -0.5, 1], daysPlanted: 13, scale: 0.8, status: 'normal' },
          { id: 'corn17', position: [3, -0.5, 3], daysPlanted: 14, scale: 0.85, status: 'good' },
          { id: 'corn18', position: [5, -0.5, 2], daysPlanted: 14, scale: 0.8, status: 'bad' },
        ]}
        onPlantClick={handleCornPlantClick}
        onPlantHover={handleCornPlantHover}
      />

      {/* Đường trở về trang trại (đơn giản là một mặt phẳng màu nâu) */}
      <mesh 
        position={[0, -0.45, 5]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        onClick={() => {
          // Sự kiện để quay về trang trại chính
          window.dispatchEvent(new CustomEvent('return-to-farm', {}));
        }}
      >
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Text "Quay lại trang trại" - Sẽ tạo một placeholder đơn giản */}
      <mesh position={[0, 0.5, 5]}>
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      
      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        makeDefault
        dampingFactor={0.1}
        rotateSpeed={0.7}
        zoomSpeed={1.5}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
}

// Component chính cho CornGarden
function CornGardenScene() {
  return <CornGardenContent />;
}

export default CornGardenScene;