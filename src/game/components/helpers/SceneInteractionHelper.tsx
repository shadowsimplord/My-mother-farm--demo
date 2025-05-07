import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ENABLE_DEV_TOOLS } from '../../../App';

/**
 * Custom hook để xử lý các tương tác với scene và gửi thông tin cho DevTools
 */
export function useSceneInteraction() {
  const { scene, camera } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);
  
  // Gửi thông tin camera về DevTools mỗi frame
  useFrame(() => {
    if (ENABLE_DEV_TOOLS) {
      window.dispatchEvent(new CustomEvent('camera-update', { 
        detail: { camera: camera.position } 
      }));
    }
  });
  
  // Xử lý sự kiện click/pointer để gửi tọa độ tới DevTools
  const handleSceneInteraction = (e: any) => {
    if (!ENABLE_DEV_TOOLS) return;
    
    e.stopPropagation();
    
    // Tạo raycast từ vị trí click
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(e.point, camera);
    
    // Kiểm tra giao nhau với các đối tượng trong scene
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const hit = intersects[0];
      
      // Phát sự kiện với thông tin chi tiết về điểm giao cắt
      const eventName = e.type === 'click' ? 'scene-click' : 'scene-pointer';
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          point: hit.point,
          object: hit.object,
          camera: camera.position
        }
      }));
    }
  };
  
  return {
    handleSceneInteraction,
    InteractionPlane: () => (
      <mesh 
        ref={planeRef}
        position={[0, -0.1, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleSceneInteraction}
        onPointerMove={handleSceneInteraction}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    )
  };
}

/**
 * Component helper cho DevTools
 */
export function DevToolsHelpers() {
  // Chỉ render khi ENABLE_DEV_TOOLS = true
  if (!ENABLE_DEV_TOOLS) return null;

  return (
    <>
      <CoordinateAxesHelper />
      <OriginPointHelper />
      <GridHelperComponent />
      <WireframeManagerComponent />
    </>
  );
}

// Tách riêng các helper components
function CoordinateAxesHelper() {
  const CoordinateAxes = React.lazy(() => import('../../../devtools/CoordinateAxes'));
  return <CoordinateAxes size={50} visible={false} />;
}

function OriginPointHelper() {
  const OriginPoint = React.lazy(() => import('../../../devtools/OriginPoint'));
  return <OriginPoint size={0.3} visible={false} />;
}

function GridHelperComponent() {
  const GridHelper = React.lazy(() => import('../../../devtools/GridHelper'));
  return <GridHelper size={50} divisions={50} />;
}

function WireframeManagerComponent() {
  const WireframeManager = React.lazy(() => import('../../../devtools/WireframeManager'));
  return <WireframeManager />;
}