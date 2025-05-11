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

  return (
    <>
      <button 
        className="absolute bottom-[10px] left-[10px] py-[5px] px-[10px] bg-farm-green text-white border-none rounded-md cursor-pointer z-[1000]"
        onClick={toggleVisibility}
      >
        {visible ? 'Hide Dev Tools' : 'Show Dev Tools'}
      </button>

      {visible && (
        <div className="absolute top-[10px] left-[10px] bg-black/70 text-white p-[10px] rounded-md font-mono z-[1000] block min-w-[250px]">
          <h3>Developer Tools</h3>
          
          {/* Hiển thị tọa độ click đầu tiên */}
          {coords && (
            <div className="mb-[5px]">
              <span className="font-bold mr-[5px]">Click Position:</span>
              <span className="text-farm-green">
                X: {coords.x}, Y: {coords.y}, Z: {coords.z}
              </span>
            </div>
          )}

          {hoveredTile && (
            <div className="mb-[5px]">
              <span className="font-bold mr-[5px]">Grid Tile:</span>
              <span className="text-farm-green">
                X: {hoveredTile.x}, Z: {hoveredTile.z}
              </span>
            </div>
          )}
          
          {/* Di chuyển camera position xuống dưới một chút */}
          <div className="mb-[5px] mt-[10px]">
            <span className="font-bold mr-[5px]">Camera Position:</span>
            <span className="text-farm-green">
              X: {cameraPosition.x}, 
              Y: {cameraPosition.y}, 
              Z: {cameraPosition.z}
            </span>
          </div>
          
          {/* Thêm phần điều khiển cho grid và wireframe */}
          <div className="mt-[15px] border-t border-white/30 pt-[10px]">
            <h4>Rendering Controls</h4>
            <button 
              className={`
                bg-gray-800 text-white border border-gray-700 rounded px-[10px] py-[5px] mr-2 mb-2 cursor-pointer text-xs transition-colors
                ${showGrid ? 'bg-farm-green border-farm-dark-green' : ''}
              `}
              onClick={toggleGrid}
            >
              {showGrid ? '✓ Grid' : '◻ Grid'}
            </button>
            <button 
              className={`
                bg-gray-800 text-white border border-gray-700 rounded px-[10px] py-[5px] mr-2 mb-2 cursor-pointer text-xs transition-colors
                ${showWireframe ? 'bg-farm-green border-farm-dark-green' : ''}
              `}
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