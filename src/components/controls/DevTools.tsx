import React, { useState, useEffect, memo } from 'react';

interface DevToolsProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

// Component hiển thị tọa độ và các thông tin dev
const DevTools: React.FC<DevToolsProps> = ({ visible, setVisible }) => {
  const [coords, setCoords] = useState<{x: number, y: number, z: number} | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{x: number, z: number} | null>(null);
  const [cameraPosition, setCameraPosition] = useState<{x: number, y: number, z: number}>({x: 0, y: 0, z: 0});

  // Toggle visibility của dev tools
  const toggleVisibility = () => {
    setVisible(!visible);
    // Phát sự kiện để hiển thị/ẩn axes helper trong scene
    window.dispatchEvent(new CustomEvent('toggle-axes', { 
      detail: { visible: !visible } 
    }));
  };

  // Cập nhật thông tin tọa độ khi nhận được từ scene
  const updateCoordinates = (data: any) => {
    if (data.point) {
      setCoords({
        x: Math.round(data.point.x * 100) / 100,
        y: Math.round(data.point.y * 100) / 100,
        z: Math.round(data.point.z * 100) / 100,
      });

      // Tính toán ô grid dựa trên tọa độ
      const gridX = Math.floor(data.point.x + 5); // Điều chỉnh offset nếu cần
      const gridZ = Math.floor(data.point.z + 5); // Điều chỉnh offset nếu cần
      
      setHoveredTile({ x: gridX, z: gridZ });
    }

    if (data.camera) {
      setCameraPosition({
        x: Math.round(data.camera.x * 100) / 100,
        y: Math.round(data.camera.y * 100) / 100,
        z: Math.round(data.camera.z * 100) / 100
      });
    }
  };

  // Thêm event listener cho custom event từ scene
  useEffect(() => {
    const handleSceneClick = (e: any) => {
      if (visible && e.detail) {
        updateCoordinates(e.detail);
      }
    };

    window.addEventListener('scene-click', handleSceneClick as EventListener);
    window.addEventListener('camera-update', handleSceneClick as EventListener);
    
    return () => {
      window.removeEventListener('scene-click', handleSceneClick as EventListener);
      window.removeEventListener('camera-update', handleSceneClick as EventListener);
    };
  }, [visible]);

  // Styles cho UI
  const styles = {
    container: {
      position: 'absolute' as const,
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      zIndex: 1000,
      display: visible ? 'block' : 'none',
    },
    toggleButton: {
      position: 'absolute' as const,
      top: '10px',
      right: '10px',
      padding: '5px 10px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      zIndex: 1000,
    },
    coordsDisplay: {
      marginBottom: '5px',
    },
    label: {
      fontWeight: 'bold' as const,
      marginRight: '5px',
    },
    value: {
      color: '#4CAF50',
    }
  };

  return (
    <>
      <button style={styles.toggleButton} onClick={toggleVisibility}>
        {visible ? 'Hide Dev Tools' : 'Show Dev Tools'}
      </button>

      {visible && (
        <div style={styles.container}>
          <h3>Developer Tools</h3>
          
          <div style={styles.coordsDisplay}>
            <span style={styles.label}>Camera Position:</span>
            <span style={styles.value}>
              X: {cameraPosition.x}, 
              Y: {cameraPosition.y}, 
              Z: {cameraPosition.z}
            </span>
          </div>

          {coords && (
            <div style={styles.coordsDisplay}>
              <span style={styles.label}>Click Position:</span>
              <span style={styles.value}>
                X: {coords.x}, Y: {coords.y}, Z: {coords.z}
              </span>
            </div>
          )}

          {hoveredTile && (
            <div style={styles.coordsDisplay}>
              <span style={styles.label}>Grid Tile:</span>
              <span style={styles.value}>
                X: {hoveredTile.x}, Z: {hoveredTile.z}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default memo(DevTools);