import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from '../game/map/Terrain';
import FarmGrid from '../game/map/FarmGrid';
import { SoilState } from '../game/map/GridSystem';
import DevTools from '../components/DevTools';

// Component cho AxesHelper - hiển thị trục tọa độ 3D (X, Y, Z)
const CoordinateAxes = ({ size = 10, visible = false }) => {
  const axesRef = useRef<THREE.AxesHelper>(null);
  
  // Lắng nghe sự kiện toggle-axes để hiển thị/ẩn axes helper
  useEffect(() => {
    const handleToggleAxes = (e: any) => {
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
    const handleToggleAxes = (e: any) => {
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

// Hàm xử lý click vào ô đất
const handleTileClick = (x: number, z: number, setSelectedTile: React.Dispatch<React.SetStateAction<{x: number, z: number} | null>>) => {
  console.log(`Clicked on tile at (${x}, ${z})`);
  setSelectedTile({x, z});
};

// Farm scene component that contains the 3D world
export const FarmSceneContent: React.FC = () => {
  const { camera, raycaster, scene, mouse } = useThree();
  const terrainRef = useRef<THREE.Mesh>(null);
  const [selectedTile, setSelectedTile] = useState<{x: number, z: number} | null>(null);
  const [currentTool, setCurrentTool] = useState<'plow' | 'seed' | 'water' | 'harvest'>('plow');
  const [useHeightmap, setUseHeightmap] = useState<boolean>(true); // State to control heightmap usage

  // Set initial camera position
  useEffect(() => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Animation loop - Cập nhật vị trí camera và gửi thông tin đến DevTools
  useFrame((_state, _delta) => {
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
  const handleSceneClick = (event: THREE.Event) => {
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

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Environment */}
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="sunset" />
      
      {/* Coordinate Axes và Origin Point */}
      <CoordinateAxes size={50} visible={false} />
      <OriginPoint size={0.3} visible={false} />
      
      {/* Terrain - với event listener cho click and heightmap support */}
      <Terrain ref={terrainRef} onClick={handleSceneClick} useHeightmap={useHeightmap} />
      
      {/* Farm Grid */}
      <FarmGrid 
        gridSize={10} 
        tileSize={1} 
        position={[0, 0.05, 0]} 
        onTileClick={(x, z) => handleTileClick(x, z, setSelectedTile)}
      />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Toggle for heightmap */}
      <mesh position={[-20, 0, -20]} onClick={() => setUseHeightmap(prev => !prev)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={useHeightmap ? '#00ff00' : '#ff0000'} />
      </mesh>
    </>
  );
};

// Main component that sets up the Canvas
const FarmScene: React.FC = () => {
  // Trạng thái hiển thị DevTools
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <FarmSceneContent />
      </Canvas>
      
      {/* Developer Tools - đã di chuyển ra bên ngoài Canvas */}
      <DevTools visible={devToolsVisible} setVisible={setDevToolsVisible} />
      
      {/* UI Overlay - chỉ tập trung vào trồng trọt */}
      <div className="farm-ui">
        {/* Tools, inventory, seeds sẽ xuất hiện ở đây */}
      </div>
    </>
  );
};

export default FarmScene;