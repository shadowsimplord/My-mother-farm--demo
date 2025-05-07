import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook để giới hạn độ cao tối thiểu của camera so với mặt đất
 * Ngăn camera đi quá sâu xuống dưới mặt đất
 * 
 * @param minHeightAboveGround Khoảng cách tối thiểu từ camera đến mặt đất (mặc định: 1.0)
 * @returns void
 */
export function useGroundHeightLimiter(minHeightAboveGround: number = 1.0): void {
  const { scene, camera } = useThree();
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  
  useFrame(() => {
    // Chỉ kiểm tra khi đã có terrainRef
    if (!terrainRef.current) {
      // Tìm terrain mesh trong scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.name === 'terrain-mesh') {
          terrainRef.current = object;
        }
      });
      return;
    }

    // Kiểm tra vị trí mặt đất dưới camera
    const rayOrigin = new THREE.Vector3(camera.position.x, camera.position.y + 100, camera.position.z);
    const rayDirection = new THREE.Vector3(0, -1, 0);
    raycasterRef.current.set(rayOrigin, rayDirection);

    const intersects = raycasterRef.current.intersectObject(terrainRef.current, false);
    
    if (intersects.length > 0) {
      const groundPoint = intersects[0].point;
      const currentHeightAboveGround = camera.position.y - groundPoint.y;
      
      // Nếu camera quá gần mặt đất, điều chỉnh độ cao
      if (currentHeightAboveGround < minHeightAboveGround) {
        camera.position.y = groundPoint.y + minHeightAboveGround;
      }
    }
  });
}