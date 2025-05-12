import React, { useEffect, useState } from 'react';
import FarmHouse from './FarmHouse';
import ObjectDataLoader, { BuildingData } from '../../utils/ObjectDataLoader';

interface FarmBuildingsProps {
  onBuildingClick?: (buildingType: string, id: string) => void;
}

export const FarmBuildings: React.FC<FarmBuildingsProps> = ({ onBuildingClick }) => {
  // Sử dụng useState để theo dõi danh sách các ngôi nhà từ dữ liệu JSON
  const [houses, setHouses] = useState<BuildingData[]>([]);

  // Load dữ liệu nhà từ JSON khi component mount
  useEffect(() => {
    const objectData = ObjectDataLoader.getInstance();
    const houseData = objectData.getHouses();
    
    console.log(`[FarmBuildings] Loaded ${houseData.length} houses from data`);
    setHouses(houseData);
  }, []);const handleClick = (buildingType: string, id: string) => {
    if (onBuildingClick) {
      onBuildingClick(buildingType, id);
    }
    
    // Chuyển camera đến viewpoint của nhà nếu click vào nhà
    if (buildingType === 'farmhouse') {
      if (window.farmCameraController) {
        window.farmCameraController.goToView('house');
      }
      
      // Hiển thị panel thông tin nhà sau khi di chuyển camera
      setTimeout(() => {
        if (window.farmUI) {
          window.farmUI.showPanel('house');
        }
      }, 1000);
    }
  };

  // Hiển thị thông tin debug về số lượng nhà được render
  useEffect(() => {
    console.log(`[FarmBuildings] Rendering ${houses.length} houses`);
  }, [houses]);

  return (
    <group>
      {/* Render tất cả các ngôi nhà từ dữ liệu JSON */}
      {houses.map((house) => (
        <FarmHouse 
          key={house.id}
          position={house.position} 
          scale={house.scale} 
          rotation={house.rotation}
          onClick={() => handleClick(house.type, house.id)}
        />
      ))}
    </group>
  );
};

export default FarmBuildings;
