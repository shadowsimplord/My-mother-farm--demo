import { useThree, useFrame } from '@react-three/fiber';
import { ENABLE_DEV_TOOLS } from '../../../App';

/**
 * Hook theo dõi vị trí camera và xử lý sự kiện click
 * Phát ra sự kiện cho DevTools khi cần
 */
export function usePositionTracker() {
  const { camera } = useThree();
  
  // Gửi thông tin camera đến DevTools mỗi frame
  useFrame(() => {
    if (ENABLE_DEV_TOOLS) {
      window.dispatchEvent(new CustomEvent('camera-update', { 
        detail: { camera: camera.position } 
      }));
    }
  });
  
  // Xử lý sự kiện click để phát ra tọa độ
  const handleClick = (event: any) => {
    if (!ENABLE_DEV_TOOLS) return;
    
    // Ngăn chặn sự kiện bubbling
    event.stopPropagation();
    
    // Nếu có thông tin điểm va chạm, gửi tọa độ
    if (event.point) {
      window.dispatchEvent(new CustomEvent('scene-click', {
        detail: {
          point: event.point,
          camera: camera.position
        }
      }));
    }
  };
  
  return { handleClick };
}

/**
 * Component để bắt các sự kiện click trên mặt đất
 */
export function GroundClickDetector() {
  const { handleClick } = usePositionTracker();
  
  // Chỉ render khi ENABLE_DEV_TOOLS = true
  if (!ENABLE_DEV_TOOLS) return null;
  
  return (
    <mesh 
      position={[0, -0.05, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}