import { useState, useEffect, useRef } from 'react';
import { TreeInfoExtended } from '../../game/utils/helpers/treeInfoHelpers';
import { debounce } from '../../game/utils/debounce';
import CornFieldPanel from './panels/CornFieldPanel';
import FarmHousePanel from './panels/FarmHousePanel';
import { Canvas } from '@react-three/fiber';
import { SceneType } from '../../game/managers/SceneManager';
import { PlantPanel } from './panels/BasePanel';

interface FarmUIProps {
  children?: React.ReactNode;
  currentScene?: SceneType;
}

// Định nghĩa interface cho window.farmUI trước để đồng bộ kiểu dữ liệu
export interface FarmUIInterface {
  setSelectedTree: (tree: TreeInfoExtended | null) => void;
  setHoverTreePosition: (position: number[] | null) => void;
  setSelectedCornField?: (selected: boolean) => void;
  showPanel: (locationId: string) => void;
}

// Declare global interface cho window
declare global {
  interface Window {
    farmUI?: FarmUIInterface;
  }
}

const FarmUI = ({ children, currentScene = SceneType.FARM }: FarmUIProps) => {  const [selectedTree, setSelectedTree] = useState<TreeInfoExtended | null>(null);
  // Thêm state cho việc hiển thị bảng thông tin cánh đồng ngô và nhà
  const [showCornFieldInfo, setShowCornFieldInfo] = useState<boolean>(false);
  const [showHouseInfo, setShowHouseInfo] = useState<boolean>(false);
  // Khai báo state để sử dụng trong UI indicators
  const [, setHoverTreePosition] = useState<number[] | null>(null);
  
  // Tối ưu: Tăng thời gian debounce và lưu trong useRef để tránh tạo function mới
  const debouncedSetHoverTreePosition = useRef(
    debounce((pos: number[] | null) => {
      setHoverTreePosition(pos);
    }, 40) // Tăng từ 24 lên 40ms để giảm số lần update
  ).current;

  const handleCloseInfoPanel = () => {
    setSelectedTree(null);
    setHoverTreePosition(null);
  };
  // Xử lý đóng bảng thông tin cánh đồng ngô và trở về góc nhìn chính (overview)
  const handleCloseCornFieldInfo = () => {
    setShowCornFieldInfo(false);
    
    // Trở về góc nhìn tổng quan (overview) khi đóng panel
    if (window.farmCameraController) {
      window.farmCameraController.goToView('overview');
    }
  };

  // Xử lý đóng bảng thông tin nhà và trở về góc nhìn chính
  const handleCloseHouseInfo = () => {
    setShowHouseInfo(false);
    
    // Trở về góc nhìn tổng quan khi đóng panel
    if (window.farmCameraController) {
      window.farmCameraController.goToView('overview');
    }
  };

  // Xử lý khi bấm nút vào nhà
  const handleEnterHouse = () => {
    console.log('[FarmUI] Entering house');
    setShowHouseInfo(false);
    // TODO: Thêm logic vào nhà ở đây (có thể là chức năng trong tương lai)
  };
  
  // Xử lý khi bấm nút vào vườn ngô
  const handleEnterCornGarden = () => {
    console.log('[FarmUI] Entering corn garden');
    setShowCornFieldInfo(false);
    
    // Gọi sự kiện chuyển scene
    window.dispatchEvent(new CustomEvent('prepare-scene-transition', {
      detail: { targetScene: 'corn-garden' }
    }));
  };
  const showPanel = (locationId: string) => {
    console.log(`[FarmUI] Showing panel for location: ${locationId}`);
    if (locationId === 'cornfield') {
      setShowCornFieldInfo(true);
    } else if (locationId === 'house') {
      setShowHouseInfo(true);
    } else {
      console.warn(`[FarmUI] No panel defined for location: ${locationId}`);
    }
  };

  // Export handlers to window for child components to use
  useEffect(() => {
    if (!window.farmUI) {
      window.farmUI = {
        setSelectedTree,
        setHoverTreePosition: debouncedSetHoverTreePosition,
        setSelectedCornField: setShowCornFieldInfo, // Đổi tên handler
        showPanel,
      };
    }
  }, [debouncedSetHoverTreePosition]);


  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 50 }}
        className="w-screen h-screen"
        gl={{ 
          antialias: window.devicePixelRatio > 1.5 ? false : true, // Tắt antialias trên màn hình retina
          powerPreference: 'high-performance', 
          alpha: false, // Tắt alpha để tăng hiệu suất
          stencil: false, // Tắt stencil buffer nếu không cần
          depth: true        }}
        // Thay đổi từ "demand" sang "always" để zoom hoạt động mượt mà
        frameloop="always" 
        performance={{ min: 0.5 }} // Cho phép giảm chất lượng khi FPS thấp
      >
        {children}
      </Canvas>
      
      {/* Hiển thị bảng thông tin cây thông qua PlantPanel mới */}
      {currentScene === SceneType.FARM && selectedTree && (
        <PlantPanel
          plant={selectedTree}
          onClose={handleCloseInfoPanel}
          position="topRight"
        />
      )}      {/* Hiển thị bảng thông tin cánh đồng ngô chỉ khi ở trang trại chính */}
      {currentScene === SceneType.FARM && (
        <CornFieldPanel 
          isVisible={showCornFieldInfo} 
          onClose={handleCloseCornFieldInfo} 
          onEnterCornGarden={handleEnterCornGarden}
        />
      )}

      {/* Hiển thị bảng thông tin nhà khi ở trang trại chính */}
      {currentScene === SceneType.FARM && (
        <FarmHousePanel 
          isVisible={showHouseInfo} 
          onClose={handleCloseHouseInfo} 
          onEnterHouse={handleEnterHouse}
        />
      )}
    </>
  );
};

export default FarmUI;