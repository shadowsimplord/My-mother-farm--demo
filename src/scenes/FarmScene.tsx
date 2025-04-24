import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from '../game/map/Terrain';
import { Trees } from '../game/objects/Tree';
import House from '../game/objects/House';
import { CoffeeTrees } from '../game/objects/FruitTrees/CoffeeTree';
import { CherryTrees } from '../game/objects/FruitTrees/CherryTree';
import { TreeData, TreeType, TreeInfo } from '../game/types';
import fruitTreesData from '../game/systems/FruitTreesdata.json';
import objectData from '../game/systems/objectdata.json';
import SelectionIndicator from '../game/objects/SelectionIndicator';

import DevTools from '../components/DevTools';

// Component cho AxesHelper - hiển thị trục tọa độ 3D (X, Y, Z)
const CoordinateAxes = ({ size = 10, visible = false }) => {
  const axesRef = useRef<THREE.AxesHelper>(null);
  
  // Lắng nghe sự kiện toggle-axes để hiển thị/ẩn axes helper
  useEffect(() => {
    const handleToggleAxes = (e: CustomEvent<{visible: boolean}>) => {
      if (axesRef.current) {
        axesRef.current.visible = e.detail.visible;
      }
    };
    
    window.addEventListener('toggle-axes', handleToggleAxes as EventListener);
    
    return () => {
      window.removeEventListener('toggle-axes', handleToggleAxes as EventListener);
    };
  }, []);

  return <axesHelper ref={axesRef} args={[size]} visible={visible} />;
};

// Component hiển thị điểm gốc tọa độ (0, 0, 0)
const OriginPoint = ({ size = 0.2, visible = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Lắng nghe sự kiện toggle-axes để hiển thị/ẩn điểm gốc tọa độ
  useEffect(() => {
    const handleToggleAxes = (e: CustomEvent<{visible: boolean}>) => {
      if (meshRef.current) {
        meshRef.current.visible = e.detail.visible;
      }
    };
    
    window.addEventListener('toggle-axes', handleToggleAxes as EventListener);
    
    return () => {
      window.removeEventListener('toggle-axes', handleToggleAxes as EventListener);
    };
  }, []);

  return (
    <mesh ref={meshRef} visible={visible} position={[0, 0, 0]}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

// Main component that sets up the Canvas
const FarmScene: React.FC = () => {
  // Trạng thái hiển thị DevTools
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [selectedTree, setSelectedTree] = useState<TreeInfo | null>(null);
  const [hoverTreePosition, setHoverTreePosition] = useState<[number, number, number] | null>(null);
  
  // Hàm đóng bảng thông tin, khi đóng cũng sẽ xóa hiệu ứng hover
  const handleCloseInfoPanel = () => {
    setSelectedTree(null);
    // Đồng thời xóa hiệu ứng hover trên cây
    setHoverTreePosition(null);
  };
  
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <FarmSceneContent 
          onSelectTree={(tree) => setSelectedTree(tree)} 
          hoverTreePosition={hoverTreePosition}
          setHoverTreePosition={setHoverTreePosition}
        />
      </Canvas>
      
      {/* Developer Tools - đã di chuyển ra bên ngoài Canvas */}
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
              {selectedTree.type === 'cherry' ? 'Cây Anh Đào NFT' : 'Cây Cà Phê NFT'}
            </h2>
            <button 
              onClick={handleCloseInfoPanel} // Sử dụng hàm mới thay vì chỉ setSelectedTree(null)
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

// Cập nhật interface cho FarmSceneContent để nhận thêm props
interface FarmSceneContentProps {
  onSelectTree: (tree: TreeInfo | null) => void;
  hoverTreePosition: [number, number, number] | null;
  setHoverTreePosition: React.Dispatch<React.SetStateAction<[number, number, number] | null>>;
}

// Cập nhật component Farm Scene Content
export const FarmSceneContent: React.FC<FarmSceneContentProps> = ({ 
  onSelectTree,
  hoverTreePosition,
  setHoverTreePosition
}) => {
  const { camera, raycaster, scene, mouse } = useThree();
  const terrainRef = useRef<THREE.Mesh>(null);
  const [useHeightmap, setUseHeightmap] = useState<boolean>(true);
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [selectedTreePosition, setSelectedTreePosition] = useState<[number, number, number] | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Set initial camera position
  useEffect(() => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Handle tree selection directly
  const handleSelectTree = (tree: TreeInfo | null) => {
    console.log("Tree clicked:", tree);
    if (tree) {
      // Lưu vị trí của cây đã chọn để hiển thị hiệu ứng
      setSelectedTreePosition(tree.position);
      // Pass tree data to parent component
      onSelectTree(tree);
    } else {
      setSelectedTreePosition(null);
      onSelectTree(null);
    }
  };

  // Lấy setter từ component cha
  useEffect(() => {
    const handleTreeAction = (e: CustomEvent<{action: string; treeId: string}>) => {
      if (e.detail && e.detail.action && e.detail.treeId) {
        console.log(`Performing action: ${e.detail.action} on tree: ${e.detail.treeId}`);
        
        // Hiển thị hiệu ứng hành động
        setActionInProgress(e.detail.action);
        
        // Mô phỏng thời gian để hoàn thành hành động
        setTimeout(() => {
          setActionInProgress(null);
          // Thông báo hành động đã hoàn thành
          window.dispatchEvent(new CustomEvent('tree-action-completed', { 
            detail: { 
              action: e.detail.action, 
              treeId: e.detail.treeId,
              success: true 
            } 
          }));
        }, 1500);
      }
    };
    
    window.addEventListener('tree-action', handleTreeAction as EventListener);
    
    return () => {
      window.removeEventListener('tree-action', handleTreeAction as EventListener);
    };
  }, []);

  // Thay đổi đoạn code tạo cây để sử dụng vị trí cố định thay vì raycasting
  useEffect(() => {
    if (terrainRef.current) {
      console.log("FarmScene: Loading fixed tree positions from objectData");
      
      // Sử dụng vị trí cố định từ objectData
      const fixedTrees: TreeData[] = objectData.map(tree => {
        // Sử dụng trực tiếp tọa độ xyz từ file cấu hình không cần raycasting
        return {
          position: [...tree.position] as [number, number, number],
          rotation: tree.rotation ? [...tree.rotation] as [number, number, number] : [0, 0, 0],
          scale: tree.scale || 1.0,
          type: tree.type as TreeType
        };
      });
      
      console.log(`Loaded ${fixedTrees.length} trees with predefined positions`);
      setTrees(fixedTrees);
    }
  }, []);

  // Animation loop - Cập nhật vị trí camera và gửi thông tin đến DevTools
  useFrame(() => {
    // Gửi thông tin vị trí camera cho DevTools
    window.dispatchEvent(new CustomEvent('camera-update', { 
      detail: { 
        camera: { 
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        } 
      } 
    }));
  });

  // Xử lý click vào scene
  const handleSceneClick = (event: ThreeEvent<MouseEvent>) => {
    // Ngăn bubbling để không bị double handling
    event.stopPropagation();
    
    // Tính toán điểm va chạm với địa hình
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      // Gửi thông tin điểm click cho DevTools
      window.dispatchEvent(new CustomEvent('scene-click', { 
        detail: { 
          point: { 
            x: point.x,
            y: point.y,
            z: point.z 
          } 
        } 
      }));
    }
  };

  // Hàm xử lý hover vào cây
  const handleTreeHover = (info: TreeInfo, isHovering: boolean) => {
    if (isHovering) {
      // Chỉ cập nhật nếu không có cây nào đang được chọn
      if (!selectedTreePosition) {
        // Luôn cập nhật vị trí hover mới, bất kể có cây nào đang được hover trước đó
        const positionCopy: [number, number, number] = [...info.position] as [number, number, number];
        setHoverTreePosition(positionCopy);
      }
    } else {
      // Chỉ xóa hover nếu vị trí hover trùng với vị trí cây đang hover
      if (hoverTreePosition && 
          hoverTreePosition[0] === info.position[0] && 
          hoverTreePosition[1] === info.position[1] && 
          hoverTreePosition[2] === info.position[2]) {
        setHoverTreePosition(null);
      }
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="sunset" />
      
      <CoordinateAxes size={50} visible={false} />
      <OriginPoint size={0.3} visible={false} />
      
      <Terrain ref={terrainRef} onClick={handleSceneClick} useHeightmap={useHeightmap} />
      
      <House position={[-2.62, -1.97, -1.05]} rotation={[0, Math.PI / 2, 0]} scale={1.5} />
      
      {trees.length > 0 && <Trees trees={trees} />}
      
      {fruitTreesData && (
        <>
          <CoffeeTrees 
            trees={fruitTreesData.filter(tree => tree.type === 'coffee-tree')} 
            onTreeClick={(info) => {
              console.log("Coffee tree clicked:", info);
              handleSelectTree(info);
            }}
            onTreeHover={(info, isHovering) => handleTreeHover(info, isHovering)}
          />
          <CherryTrees 
            trees={fruitTreesData.filter(tree => tree.type === 'cherry')} 
            onTreeClick={(info) => {
              console.log("Cherry tree clicked:", info);
              handleSelectTree(info);
            }}
            onTreeHover={(info, isHovering) => handleTreeHover(info, isHovering)}
          />
        </>
      )}
      
      {hoverTreePosition && !selectedTreePosition && (
        <SelectionIndicator 
          position={hoverTreePosition}
          size={1.2}
          color="#BBDEFB"
          key={`hover-indicator-${hoverTreePosition.join(',')}`}
        />
      )}

      {selectedTreePosition && (
        <SelectionIndicator 
          position={selectedTreePosition}
          size={1.5}
          color={actionInProgress ? getActionColor(actionInProgress) : "#4CAF50"}
          key={`select-indicator-${selectedTreePosition.join(',')}`}
        />
      )}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
      />

      <mesh position={[-20, 0, -20]} onClick={() => setUseHeightmap(prev => !prev)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={useHeightmap ? '#00ff00' : '#ff0000'} />
      </mesh>
    </>
  );
};

// Các hàm helper để tính toán và hiển thị thông tin cây
function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'good': return '#4CAF50'; // Xanh lá - cây khỏe mạnh
    case 'normal': return '#FF9800'; // Cam - cây bình thường
    case 'bad': return '#F44336'; // Đỏ - cây không khỏe
    default: return '#9E9E9E'; // Xám - không có thông tin
  }
}

function getStatusLabel(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'good': return '✅ Khỏe Mạnh';
    case 'normal': return '⚠️ Bình Thường';
    case 'bad': return '❌ Cần Chăm Sóc';
    default: return '❓ Không Xác Định';
  }
}

function calculateYield(tree: any): number {
  // Tính năng suất dựa trên tuổi cây và trạng thái
  let baseYield = 0;
  
  // Dựa trên tuổi cây
  if (tree.daysPlanted < 5) {
    baseYield = 0; // Cây còn non chưa cho quả
  } else if (tree.daysPlanted < 10) {
    baseYield = 30; // Cây bắt đầu cho quả
  } else if (tree.daysPlanted < 30) {
    baseYield = 70; // Cây đang phát triển tốt
  } else {
    baseYield = 100; // Cây trưởng thành hoàn toàn
  }
  
  // Điều chỉnh dựa trên trạng thái
  switch (tree.status?.toLowerCase()) {
    case 'good': return baseYield;
    case 'normal': return Math.floor(baseYield * 0.8);
    case 'bad': return Math.floor(baseYield * 0.5);
    default: return baseYield;
  }
}

function calculatePrice(tree: any): number {
  // Tính giá thuê dựa trên loại cây và năng suất
  let basePrice = tree.type === 'cherry' ? 12 : 9; // Giá cơ bản: Cherry đắt hơn Coffee
  
  // Điều chỉnh theo năng suất
  const yield_ = calculateYield(tree);
  const yieldFactor = yield_ / 100;
  
  // Tính giá cuối cùng (làm tròn đến 1 số thập phân)
  return Math.round((basePrice * (0.7 + yieldFactor * 0.3)) * 10) / 10;
}

function getActionColor(action: string): string {
  switch (action.toLowerCase()) {
    case 'plow': return '#FF9800'; // Cam - hành động cày
    case 'seed': return '#4CAF50'; // Xanh lá - hành động gieo hạt
    case 'water': return '#2196F3'; // Xanh dương - hành động tưới nước
    case 'harvest': return '#FFC107'; // Vàng - hành động thu hoạch
    default: return '#9E9E9E'; // Xám - không xác định
  }
}

export default FarmScene;