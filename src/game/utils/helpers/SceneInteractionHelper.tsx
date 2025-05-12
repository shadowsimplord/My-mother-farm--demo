import React, { useRef, useState, useEffect } from 'react';
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
    }  });
  // Xử lý sự kiện click/pointer để gửi tọa độ tới DevTools
  const handleSceneInteraction = (
    e: { stopPropagation?: () => void; point?: { x: number; y: number }; nativeEvent?: { clientX: number; clientY: number }; type?: string }
  ) => {
    if (!ENABLE_DEV_TOOLS) return;
    
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    // Tạo raycast từ vị trí click
    const raycaster = new THREE.Raycaster();
    
    // Kiểm tra và sử dụng e.point nếu có
    const pointer = new THREE.Vector2();
    if (e.point) {
      pointer.x = e.point.x;
      pointer.y = e.point.y;
    } else if (e.nativeEvent) {
      // Fallback nếu không có point
      pointer.x = (e.nativeEvent.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.nativeEvent.clientY / window.innerHeight) * 2 + 1;
    }
    
    raycaster.setFromCamera(pointer, camera);
    
    // Kiểm tra giao nhau với các đối tượng trong scene
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const hit = intersects[0];
      
      // Phát sự kiện với thông tin chi tiết về điểm giao cắt
      const eventName = 'scene-' + (e.type || 'interaction');
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
 * Component quản lý tương tác với CornField
 */
export function useCornFieldInteraction() {
  const [showCornFieldInfo, setShowCornFieldInfo] = useState(false);
  
  // Đăng ký lắng nghe sự kiện click vào cánh đồng từ Three.js và camera movement
  useEffect(() => {
    console.log('[SceneInteractionHelper] Setting up field interaction listeners');
      // When cornfield is clicked directly
    const handleCornFieldClick = () => {
      console.log('[SceneInteractionHelper] CornField clicked event received');
      // Move the camera to cornfield view
      if (window.farmCameraController) {
        window.farmCameraController.goToView('cornfield');
      }
    };
    
    // Listen for navigation to cornfield via buttons
    const handleViewChanging = (e: CustomEvent) => {      if (e.detail && e.detail.toViewId === 'cornfield') {
        console.log('[SceneInteractionHelper] Camera moving to cornfield view');
        // Hide panel during camera movement
        setShowCornFieldInfo(false);
      }
    };
    
    // When camera stops moving to cornfield view
    const handleViewChanged = (e: CustomEvent) => {
      if (e.detail && e.detail.viewId === 'cornfield') {
        console.log('[SceneInteractionHelper] Camera reached cornfield view, showing panel');
        // Show panel with a delay after camera stops
        setTimeout(() => {
          // Thay đổi tên hàm từ setSelectedField sang setSelectedCornField
          if (window.farmUI?.setSelectedCornField) {
            window.farmUI.setSelectedCornField(true);
          }
        }, 500);
      } else {
        // Hide panel when moving to any other view
        if (window.farmUI?.setSelectedCornField) {
          window.farmUI.setSelectedCornField(false);
        }
      }
    };      window.addEventListener('cornfield-clicked', handleCornFieldClick);
    window.addEventListener('view-changing', handleViewChanging as EventListener);
    window.addEventListener('view-changed', handleViewChanged as EventListener);
      return () => {
      window.removeEventListener('cornfield-clicked', handleCornFieldClick);
      window.removeEventListener('view-changing', handleViewChanging as EventListener);
      window.removeEventListener('view-changed', handleViewChanged as EventListener);
    };
  }, []);  // Handle direct click on the cornfield in Three.js scene
  const handleCornFieldClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    console.log('[SceneInteractionHelper] CornField clicked directly in Three.js scene');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cornfield-clicked'));
  };
  return {
    showCornFieldInfo,
    handleFieldClick: handleCornFieldClick
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