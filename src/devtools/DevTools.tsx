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
  
  // Thêm state cho grid và wireframe
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // Toggle visibility của dev tools
  const toggleVisibility = () => {
    const newVisibility = !visible;
    setVisible(newVisibility);
    
    // Phát sự kiện để hiển thị/ẩn axes helper trong scene
    window.dispatchEvent(new CustomEvent('toggle-axes', { 
      detail: { visible: newVisibility } 
    }));
    
    // Phát sự kiện thông báo trạng thái hiển thị của DevTools
    window.dispatchEvent(new CustomEvent('devtools-visibility', {
      detail: { visible: newVisibility }
    }));
  };

  // Phát sự kiện khi component được mount hoặc unmount
  useEffect(() => {
    // Phát sự kiện thông báo trạng thái hiển thị ban đầu của DevTools
    window.dispatchEvent(new CustomEvent('devtools-visibility', {
      detail: { visible: visible }
    }));
    
    return () => {
      // Phát sự kiện khi component bị unmount
      window.dispatchEvent(new CustomEvent('devtools-visibility', {
        detail: { visible: false }
      }));
    };
  }, [visible]);

  // Toggle hiển thị grid
  const toggleGrid = () => {
    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);
    // Phát sự kiện để hiển thị/ẩn grid helper trong scene
    window.dispatchEvent(new CustomEvent('toggle-grid', { 
      detail: { visible: newShowGrid } 
    }));
  };

  // Toggle hiển thị wireframe
  const toggleWireframe = () => {
    const newShowWireframe = !showWireframe;
    setShowWireframe(newShowWireframe);
    // Phát sự kiện để hiển thị/ẩn wireframe trong scene
    window.dispatchEvent(new CustomEvent('toggle-wireframe', { 
      detail: { visible: newShowWireframe } 
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

    const handleScenePointer = (e: any) => {
      if (visible && e.detail) {
        updateCoordinates(e.detail);
      }
    };

    window.addEventListener('scene-click', handleSceneClick as EventListener);
    window.addEventListener('camera-update', handleSceneClick as EventListener);
    window.addEventListener('scene-pointer', handleScenePointer as EventListener);
    
    return () => {
      window.removeEventListener('scene-click', handleSceneClick as EventListener);
      window.removeEventListener('camera-update', handleSceneClick as EventListener);
      window.removeEventListener('scene-pointer', handleScenePointer as EventListener);
    };
  }, [visible]);

  // Styles cho UI
  const styles = {
    container: {
      position: 'absolute' as const,
      top: '10px',
      left: '10px', 
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      zIndex: 1000,
      display: visible ? 'block' : 'none',
      minWidth: '250px',
    },
    toggleButton: {
      position: 'absolute' as const,
      bottom: '10px', // Thay đổi từ top thành bottom
      left: '10px',
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
    },
    controlsContainer: {
      marginTop: '15px',
      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
      paddingTop: '10px',
    },
    controlButton: {
      backgroundColor: '#333',
      color: 'white',
      border: '1px solid #555',
      borderRadius: '4px',
      padding: '5px 10px',
      marginRight: '8px',
      marginBottom: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'background-color 0.2s',
    },
    activeButton: {
      backgroundColor: '#4CAF50',
      border: '1px solid #2e7d32',
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
          
          {/* Hiển thị tọa độ click đầu tiên */}
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
          
          {/* Di chuyển camera position xuống dưới một chút */}
          <div style={{...styles.coordsDisplay, marginTop: '10px'}}>
            <span style={styles.label}>Camera Position:</span>
            <span style={styles.value}>
              X: {cameraPosition.x}, 
              Y: {cameraPosition.y}, 
              Z: {cameraPosition.z}
            </span>
          </div>
          
          {/* Thêm phần điều khiển cho grid và wireframe */}
          <div style={styles.controlsContainer}>
            <h4>Rendering Controls</h4>
            <button 
              style={{
                ...styles.controlButton,
                ...(showGrid ? styles.activeButton : {})
              }} 
              onClick={toggleGrid}
            >
              {showGrid ? '✓ Grid' : '◻ Grid'}
            </button>
            <button 
              style={{
                ...styles.controlButton,
                ...(showWireframe ? styles.activeButton : {})
              }} 
              onClick={toggleWireframe}
            >
              {showWireframe ? '✓ Wireframe' : '◻ Wireframe'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(DevTools);