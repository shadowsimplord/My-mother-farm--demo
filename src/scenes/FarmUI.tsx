import { useState, useEffect, useRef } from 'react';
import { TreeInfoExtended } from '../game/utils/treeInfoHelpers';
import { debounce } from '../game/utils/debounce';
import FarmNavigation from '../components/ui/FarmNavigation';
import DevTools from '../components/controls/DevTools';
import { Canvas } from '@react-three/fiber';
import {
  getStatusColor,
  getStatusLabel,
  calculateYield,
  calculatePrice
} from '../game/utils/treeInfoHelpers';
import { Stats } from '@react-three/drei';

interface FarmUIProps {
  children?: React.ReactNode;
}

const FarmUI = ({ children }: FarmUIProps) => {
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [selectedTree, setSelectedTree] = useState<TreeInfoExtended | null>(null);
  // Khai báo state để sử dụng trong UI indicators (thêm comment để giải thích mục đích sử dụng)
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
        {/* Thêm Stats để theo dõi FPS (chỉ hiển thị khi devToolsVisible = true) */}
        {devToolsVisible && <Stats />}
      </Canvas>
      
      <FarmNavigation position="right" />
      
      <DevTools visible={devToolsVisible} setVisible={setDevToolsVisible} />
      
      {/* NFT Tree Info Panel */}
      {selectedTree && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 20,
          transform: 'translateY(-50%)',
          width: '300px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 128, 0, 0.3)',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          fontFamily: 'Arial, sans-serif',
          color: '#333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #4CAF50',
            paddingBottom: 10,
            marginBottom: 15
          }}>
            <h2 style={{ margin: 0, color: '#2E7D32', fontSize: '1.4rem' }}>
              {selectedTree.type === 'cherry' ? 'Cây Anh Đào ' : 
               selectedTree.type === 'corn' ? 'Cây Ngô ' : 
               'Cây Cà Phê '}
            </h2>
            <button 
              onClick={handleCloseInfoPanel}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#777'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ margin: '15px 0' }}>
            <div style={{ 
              background: getStatusColor(selectedTree.status), 
              color: '#fff', 
              padding: '8px 12px', 
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '12px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {getStatusLabel(selectedTree.status)}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#555' }}>ID:</div>
              <div style={{ color: '#000' }}>{selectedTree.id}</div>
              
              <div style={{ fontWeight: 'bold', color: '#555' }}>Tuổi cây:</div>
              <div style={{ color: '#000' }}>{selectedTree.daysPlanted} ngày</div>
              
              <div style={{ fontWeight: 'bold', color: '#555' }}>Năng suất:</div>
              <div style={{ color: '#000' }}>{calculateYield(selectedTree)}%</div>
              
              <div style={{ fontWeight: 'bold', color: '#555' }}>Vị trí:</div>
              <div style={{ color: '#000', fontSize: '0.9rem' }}>[{selectedTree.position?.map((p: number) => Math.round(p * 100) / 100).join(', ')}]</div>
            </div>
          </div>
          
          <div style={{
            background: '#f5f5f5',
            borderRadius: 8,
            padding: 12,
            marginTop: 15
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#333' }}>
              Thông tin NFT
            </h3>
            <div style={{ fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Chủ sở hữu:</span>
                <span style={{ fontWeight: 'bold', color: '#1976D2' }}>
                  {selectedTree.owner || 'MyMotherFarm'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>Giá thuê:</span>
                <span style={{ fontWeight: 'bold', color: '#388E3C' }}>
                  {calculatePrice(selectedTree)} USDT/tháng
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Thời hạn:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {selectedTree.leasePeriod || '12 tháng'}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button style={{
              flex: 1,
              padding: '10px 0',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Thuê Cây
            </button>
            <button style={{
              flex: 1,
              padding: '10px 0',
              background: '#FFA000',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Chi tiết
            </button>
          </div>
        </div>
      )}
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