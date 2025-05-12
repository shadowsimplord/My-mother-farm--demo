import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import Terrain from './Terrain';

const FarmTerrain = ({ onClick }: { onClick?: (event: ThreeEvent<MouseEvent>) => void }) => {
  const terrainRef = useRef<THREE.Mesh>(null);
  const [useHeightmap] = useState<boolean>(true);
  return (
    <>
      {/* Địa hình chính - chi tiết và tương tác */}      <Terrain 
        ref={terrainRef} 
        onClick={(e: THREE.Event) => onClick && onClick(e as unknown as ThreeEvent<MouseEvent>)} 
        useHeightmap={useHeightmap} 
      />
    </>
  );
};

export default FarmTerrain;