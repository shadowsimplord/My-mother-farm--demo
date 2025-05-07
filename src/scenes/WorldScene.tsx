import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect } from 'react'

import FarmTerrain from '../game/components/farm/FarmTerrain'
import FarmEnvironment from '../game/components/farm/FarmEnvironment' 
import FruitTreesCollection from '../game/objects/FruitTrees/FruitTreesCollection'
import CameraController from '../game/controllers/CameraController'
import { usePositionTracker, GroundClickDetector } from '../game/components/helpers/PositionTracker'
import DevToolsComponents from '../game/components/helpers/DevToolsComponents'
import { useGroundHeightLimiter } from '../hooks/useGroundHeightLimiter'

// Component con này sẽ được render bên trong Canvas
function WorldSceneContent() {
  const { scene, camera, gl } = useThree();
  const { handleClick } = usePositionTracker();
  
  // Sử dụng hook để giới hạn độ cao camera so với mặt đất
  useGroundHeightLimiter(1.0);
  
  scene.background = new THREE.Color('#b0e0f7')
  gl.toneMapping = THREE.LinearToneMapping
  
  // Set initial position immediately to avoid flicker
  useEffect(() => {
    camera.position.set(15, 15, 15)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
  }, [camera])
  
  return (
    <>
      <CameraController initialViewId="overview" transitionDuration={1.5} />
      
      <FarmEnvironment />
      
      {/* Plane không nhìn thấy để bắt sự kiện click trên nền */}
      <GroundClickDetector />
      
      <FarmTerrain onClick={handleClick} />
      <FruitTreesCollection />
      
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

// Component chính không sử dụng useThree
export default function WorldScene() {
  return <WorldSceneContent />
}