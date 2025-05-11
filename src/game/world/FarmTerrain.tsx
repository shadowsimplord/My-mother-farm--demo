import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import Terrain from './Terrain';

const FarmTerrain = ({ onClick }: { onClick?: (event: ThreeEvent<MouseEvent>) => void }) => {
  const terrainRef = useRef<THREE.Mesh>(null);
  const [useHeightmap] = useState<boolean>(true);

  return (
    <>
      <Terrain 
        ref={terrainRef} 
        onClick={(e: any) => onClick && onClick(e)} 
        useHeightmap={useHeightmap} 
      />
    </>
  );
};

export default FarmTerrain;