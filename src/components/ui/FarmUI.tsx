import { useState, useEffect, useRef } from 'react';
import { TreeInfoExtended } from '../../game/utils/helpers/treeInfoHelpers';
import { debounce } from '../../game/utils/debounce';
import FarmNavigation from './FarmNavigation';
import FieldInfoPanel from './panels/FieldInfoPanel';
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
  setSelectedField?: (selected: boolean) => void;
}

// Declare global interface cho window
declare global {
  interface Window {
    farmUI?: FarmUIInterface;
  }
}

const FarmUI = ({ children, currentScene = SceneType.FARM }: FarmUIProps) => {
  const [selectedTree, setSelectedTree] = useState<TreeInfoExtended | null>(null);
  // Thêm state cho việc hiển thị bảng thông tin cánh đồng
  const [showFieldInfo, setShowFieldInfo] = useState<boolean>(false);
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
  
  // Xử lý đóng bảng thông tin cánh đồng
  const handleCloseFieldInfo = () => {
    setShowFieldInfo(false);
  };
  
  // Xử lý khi bấm nút vào vườn ngô
  const handleEnterCornGarden = () => {
    console.log('[FarmUI] Entering corn garden');
    setShowFieldInfo(false);
    
    // Gọi sự kiện chuyển scene
    window.dispatchEvent(new CustomEvent('prepare-scene-transition', {
      detail: { targetScene: 'corn-garden' }
    }));
  };

  // Export handlers to window for child components to use
  useEffect(() => {
    window.farmUI = {
      setSelectedTree,
      setHoverTreePosition: debouncedSetHoverTreePosition,
      setSelectedField: setShowFieldInfo // Thêm handler mới
    };
    
    return () => {
      window.farmUI = undefined;
    };
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
          depth: true 
        }}
        // Thay đổi từ "demand" sang "always" để zoom hoạt động mượt mà
        frameloop="always" 
        performance={{ min: 0.5 }} // Cho phép giảm chất lượng khi FPS thấp
      >
        {children}
       
      </Canvas>
      
      {/* Chỉ hiển thị FarmNavigation khi ở trang trại chính */}
      {currentScene === SceneType.FARM && <FarmNavigation position="right" />}
        {/* Hiển thị bảng thông tin cây thông qua PlantPanel mới */}
      {currentScene === SceneType.FARM && selectedTree && (
        <PlantPanel
          plant={selectedTree}
          onClose={handleCloseInfoPanel}
          position="topRight"
        />
      )}
      
      {/* Hiển thị bảng thông tin cánh đồng chỉ khi ở trang trại chính */}
      {currentScene === SceneType.FARM && (
        <FieldInfoPanel 
          isVisible={showFieldInfo} 
          onClose={handleCloseFieldInfo} 
          onEnterCornGarden={handleEnterCornGarden}
        />
      )}
    </>
  );
};

export default FarmUI;