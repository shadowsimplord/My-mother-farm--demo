import { useRef, useState, useEffect } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import Terrain from '../../world/Terrain';
import House from '../../objects/House';
import { Trees } from '../../objects/Tree';
import { TreeData, TreeType } from '../../types';
import objectData from '../../systems/data/FruitTreesdata.json';

const FarmTerrain = ({ onClick }: { onClick?: (event: ThreeEvent<MouseEvent>) => void }) => {
  const terrainRef = useRef<THREE.Mesh>(null);
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [useHeightmap] = useState<boolean>(true);
  
  useEffect(() => {
    if (terrainRef.current) {
      console.log("FarmTerrain: Loading fixed tree positions from objectData");
      
      // Sử dụng vị trí cố định từ objectData
      const fixedTrees: TreeData[] = objectData.map(tree => {
        return {
          position: [...tree.position] as [number, number, number],
          rotation: [0, 0, 0],
          scale: 1.0,
          type: tree.type as TreeType
        };
      });
      
      console.log(`Loaded ${fixedTrees.length} trees with predefined positions`);
      setTrees(fixedTrees);
    }
  }, []);

  return (
    <>
      <Terrain 
        ref={terrainRef} 
        onClick={(e: any) => onClick && onClick(e)} 
        useHeightmap={useHeightmap} 
      />
      
      <House position={[-2.62, -1.97, -1.05]} rotation={[0, Math.PI / 2, 0]} scale={1.5} />
      
      {trees.length > 0 && <Trees trees={trees} />}
    </>
  );
};

export default FarmTerrain;