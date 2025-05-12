import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect } from 'react'

import FarmTerrain from '../game/world/FarmTerrain'
import FarmEnvironment from '../game/world/FarmEnvironment' 
import CornField from '../game/objects/field/CornField' // Tương lai nên đổi đường dẫn thư mục thành cornfield
import CameraController from '../components/controls/CameraController'
import { usePositionTracker, GroundClickDetector } from '../game/utils/helpers/PositionTracker'
import DevToolsComponents from '../game/utils/helpers/DevToolsComponents'
import { useGroundHeightLimiter } from '../hooks/useGroundHeightLimiter'
import { useCornFieldInteraction } from '../game/utils/helpers/SceneInteractionHelper'
import CornGardenScene from './CornGardenScene'
import { SceneType } from '../game/managers/SceneManager'
import NavigationMarkers from '../game/objects/navigation/NavigationMarkers'
import FarmBuildings from '../game/objects/buildings/FarmBuildings'

// Component con này sẽ được render bên trong Canvas
function FarmSceneContent() {
  const { scene, camera, gl } = useThree();
  const { handleClick } = usePositionTracker();
  const { handleFieldClick } = useCornFieldInteraction();
  
  // Sử dụng hook để giới hạn độ cao camera so với mặt đất
  useGroundHeightLimiter(1.0);
  
  // Set initial position immediately to avoid flicker
  useEffect(() => {
    camera.position.set(15, 15, 15)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    
    scene.background = new THREE.Color('#b0e0f7')
    gl.toneMapping = THREE.LinearToneMapping
  }, [camera, scene, gl])
    return (
    <>
      <CameraController initialViewId="overview" transitionDuration={1.5} />
      
      <FarmEnvironment />
      
      {/* Plane không nhìn thấy để bắt sự kiện click trên nền */}
      <GroundClickDetector />
        <FarmTerrain onClick={handleClick} />
      
      {/* Giữ nguyên vị trí CornField theo yêu cầu */}      <CornField 
        position={[8, -0.5, 6]} 
        scale={0.5} 
        onClick={handleFieldClick} 
      />
      
      {/* Farm Buildings */}
      <FarmBuildings 
        onBuildingClick={(type, id) => {
          console.log(`Building clicked: ${type}, ID: ${id}`);
          // Xử lý tương tác với tòa nhà nếu cần
        }} 
      />
      
      {/* 3D Navigation Markers */}
      <NavigationMarkers />
      
      {/* Các components DevTools */}
      <DevToolsComponents />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.7}
        zoomSpeed={1.5}
        minDistance={3}
        maxDistance={50}
      />
    </>
  )
}

function WorldScene({ currentScene = SceneType.FARM }: { currentScene?: SceneType }) {  
  // Gọi hooks quản lý cornfield interaction cho farm scene
  useCornFieldInteraction();
  
  // Render scene tương ứng dựa trên currentScene
  return (
    <>
      {currentScene === SceneType.FARM ? (
        <FarmSceneContent />
      ) : (
        <CornGardenScene />
      )}
    </>
  );
}

export default WorldScene;