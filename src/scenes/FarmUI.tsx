import { useState, useEffect, useRef } from 'react';
import { TreeInfoExtended } from '../game/utils/treeInfoHelpers';
import { debounce } from '../game/utils/debounce';
import FarmNavigation from '../components/ui/FarmNavigation';
import TreeInfoPanel from '../components/ui/TreeInfoPanel';
import { Canvas } from '@react-three/fiber';

interface FarmUIProps {
  children?: React.ReactNode;
}

const FarmUI = ({ children }: FarmUIProps) => {
  const [selectedTree, setSelectedTree] = useState<TreeInfoExtended | null>(null);
  // Khai báo state để sử dụng trong UI indicators
  const [, setHoverTreePosition] = useState<[number, number, number] | null>(null);
  
  // Tối ưu: Tăng thời gian debounce và lưu trong useRef để tránh tạo function mới
  const debouncedSetHoverTreePosition = useRef(
    debounce((pos: [number, number, number] | null) => {
      setHoverTreePosition(pos);
    }, 40) // Tăng từ 24 lên 40ms để giảm số lần update
  ).current;

  const handleCloseInfoPanel = () => {
    setSelectedTree(null);
    setHoverTreePosition(null);
  };

  // Export handlers to window for child components to use
  useEffect(() => {
    window.farmUI = {
      setSelectedTree,
      setHoverTreePosition: debouncedSetHoverTreePosition
    };
    
    return () => {
      window.farmUI = undefined;
    };
  }, [debouncedSetHoverTreePosition]);

  // Tối ưu: Sử dụng Canvas với các props tối ưu
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
        // Tối ưu Canvas performance
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
      
      <FarmNavigation position="right" />
      
      
      <TreeInfoPanel tree={selectedTree} onClose={handleCloseInfoPanel} />
    </>
  );
};

// Add window interface
declare global {
  interface Window {
    farmUI?: {
      setSelectedTree: (tree: TreeInfoExtended | null) => void;
      setHoverTreePosition: (position: [number, number, number] | null) => void;
    };
  }
}

export default FarmUI;