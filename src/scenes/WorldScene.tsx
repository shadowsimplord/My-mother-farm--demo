import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect } from 'react'

import FarmTerrain from '../game/components/farm/FarmTerrain'
import FarmEnvironment from '../game/components/farm/FarmEnvironment' 
import FruitTreesCollection from '../game/objects/FruitTrees/FruitTreesCollection'
import Field from '../game/objects/field/Field'
import CameraController from '../game/controllers/CameraController'
import { usePositionTracker, GroundClickDetector } from '../game/components/helpers/PositionTracker'
import DevToolsComponents from '../game/components/helpers/DevToolsComponents'
import { useGroundHeightLimiter } from '../hooks/useGroundHeightLimiter'
import { useFieldInteraction } from '../game/components/helpers/SceneInteractionHelper'
import CornGardenScene from './CornGardenScene'
import { SceneType } from '../game/managers/SceneManager'

// Component con này sẽ được render bên trong Canvas
function FarmSceneContent() {
  const { scene, camera, gl } = useThree();
  const { handleClick } = usePositionTracker();
  const { handleFieldClick } = useFieldInteraction();
  
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
      <FruitTreesCollection />
      
      {/* Giữ nguyên vị trí Field theo yêu cầu */}
      <Field 
        position={[15, -1.8, 5]} 
        scale={0.5} 
        onClick={handleFieldClick} 
      />
      
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

// WorldScene Component - Giờ chỉ là container đơn giản
function WorldScene({ currentScene = SceneType.FARM }: { currentScene?: SceneType }) {
  // Gọi hooks quản lý field interaction cho farm scene
  useFieldInteraction();
  
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