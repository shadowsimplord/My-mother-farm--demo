import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from '../game/map/Terrain';
import FarmGrid from '../game/map/FarmGrid';
import { SoilState } from '../game/map/GridSystem';

// Hàm xử lý click vào ô đất
const handleTileClick = (x: number, z: number, setSelectedTile: React.Dispatch<React.SetStateAction<{x: number, z: number} | null>>) => {
  console.log(`Clicked on tile at (${x}, ${z})`);
  setSelectedTile({x, z});
};

// Farm scene component that contains the 3D world
export const FarmSceneContent: React.FC = () => {
  const { camera } = useThree();
  const terrainRef = useRef<THREE.Mesh>(null);
  const [selectedTile, setSelectedTile] = useState<{x: number, z: number} | null>(null);
  const [currentTool, setCurrentTool] = useState<'plow' | 'seed' | 'water' | 'harvest'>('plow');

  // Set initial camera position
  useEffect(() => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Animation loop
  useFrame((_state, _delta) => {
    // Animation code nếu cần thiết
  });

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
      
      {/* Terrain */}
      <Terrain ref={terrainRef} />
      
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
    </>
  );
};

// Main component that sets up the Canvas
const FarmScene: React.FC = () => {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <FarmSceneContent />
      </Canvas>
      
      {/* UI Overlay - chỉ tập trung vào trồng trọt */}
      <div className="farm-ui">
        {/* Tools, inventory, seeds sẽ xuất hiện ở đây */}
      </div>
    </>
  );
};

export default FarmScene;