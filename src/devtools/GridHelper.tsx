import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface GridHelperProps {
  size?: number;
  divisions?: number;
  color1?: string;
  color2?: string;
}

/**
 * Component hiển thị lưới tọa độ trong không gian 3D
 */
const GridHelper: React.FC<GridHelperProps> = ({
  size = 100,
  divisions = 100,
  color1 = '#888888',
  color2 = '#444444'
}) => {
  const gridRef = useRef<THREE.GridHelper>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // Xử lý sự kiện toggle-grid từ DevTools
    const handleToggleGrid = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.visible === 'boolean') {
        setVisible(e.detail.visible);
      }
    };

    // Đăng ký listener
    window.addEventListener('toggle-grid', handleToggleGrid as EventListener);
    
    return () => {
      // Hủy đăng ký khi component unmount
      window.removeEventListener('toggle-grid', handleToggleGrid as EventListener);
    };
  }, []);

  // Thêm grid vào scene với vị trí và kích thước phù hợp
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.position.y = 0.01; // Đặt lưới hơi cao hơn mặt đất một chút
    }
  }, []);

  // Nếu không hiển thị, không render gì cả
  if (!visible) return null;

  return (
    <gridHelper 
      ref={gridRef}
      args={[size, divisions, color1, color2]}
      position={[0, 0.01, 0]}
    />
  );
};

export default GridHelper;