import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Component quản lý chế độ wireframe cho toàn bộ scene
 * Áp dụng wireframe cho tất cả các mesh trong scene khi được kích hoạt
 */
const WireframeManager: React.FC = () => {
  const [wireframeEnabled, setWireframeEnabled] = useState<boolean>(false);
  const { scene } = useThree();
  
  // Lưu trữ trạng thái ban đầu của vật liệu để khôi phục khi tắt wireframe
  const materialStates = React.useRef<Map<THREE.Material, boolean>>(new Map());

  useEffect(() => {
    // Lắng nghe sự kiện toggle-wireframe từ DevTools
    const handleToggleWireframe = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.visible === 'boolean') {
        setWireframeEnabled(e.detail.visible);
      }
    };

    window.addEventListener('toggle-wireframe', handleToggleWireframe as EventListener);
    
    return () => {
      window.removeEventListener('toggle-wireframe', handleToggleWireframe as EventListener);
    };
  }, []);

  // Chuyển đổi chế độ wireframe cho tất cả các vật liệu trong scene
  useEffect(() => {
    if (!scene) return;

    // Hàm đệ quy để duyệt qua tất cả các đối tượng trong scene
    const traverseScene = (object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) 
          ? object.material 
          : [object.material];
        
        materials.forEach(material => {
          // Lưu trạng thái wireframe ban đầu nếu chưa lưu
          if (!materialStates.current.has(material)) {
            materialStates.current.set(material, material.wireframe || false);
          }
          
          // Áp dụng trạng thái wireframe mới
          material.wireframe = wireframeEnabled;
          
          // Đánh dấu vật liệu cần cập nhật
          material.needsUpdate = true;
        });
      }
      
      // Duyệt đệ quy qua các đối tượng con
      object.children.forEach(traverseScene);
    };

    // Áp dụng cho toàn bộ scene
    traverseScene(scene);
    
    // Trả về hàm dọn dẹp để khôi phục trạng thái ban đầu khi component unmount
    return () => {
      scene.traverse(object => {
        if (object instanceof THREE.Mesh && object.material) {
          const materials = Array.isArray(object.material) 
            ? object.material 
            : [object.material];
          
          materials.forEach(material => {
            // Khôi phục trạng thái wireframe ban đầu
            if (materialStates.current.has(material)) {
              material.wireframe = materialStates.current.get(material) || false;
              material.needsUpdate = true;
            }
          });
        }
      });
    };
  }, [scene, wireframeEnabled]);

  // Component này không render bất kỳ thứ gì, nó chỉ quản lý trạng thái wireframe
  return null;
};

export default WireframeManager;