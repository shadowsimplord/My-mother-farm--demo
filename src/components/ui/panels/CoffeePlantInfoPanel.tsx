import React from 'react';
import { TreeInfo } from '../../../game/types';
import { BasePanel, PlantPanelContent } from './BasePanel';
import { getPlantConfig } from '../../../game/data/plants';

interface CoffeePlantInfoPanelProps {
  plant: TreeInfo | null;
  onClose: () => void;
}

/**
 * CoffeePlantInfoPanel - Component hiển thị thông tin cây cà phê
 * Là một lính dưới quyền chỉ huy của BasePanel
 * Sử dụng cấu hình từ hệ thống đăng ký cây
 */
const CoffeePlantInfoPanel: React.FC<CoffeePlantInfoPanelProps> = ({ plant, onClose }) => {
  if (!plant) return null;
  
  // Sử dụng thông tin từ hệ thống đăng ký cây
  const plantType = "coffee";
  const plantConfig = getPlantConfig(plantType);
  
  return (
    <BasePanel 
      isVisible={true} 
      onClose={onClose} 
      overlayPosition="topRight"
    >
      <PlantPanelContent
        isVisible={true}
        plant={plant}
        onClose={onClose}
        plantType={plantType}
        plantLabel={plantConfig.label}
        basePrice={plantConfig.basePrice}
        iconEmoji={plantConfig.icon}
        customColor={plantConfig.color}
        customDetails={plantConfig.renderDetails(plant)}
      />
    </BasePanel>
  );
};

export default CoffeePlantInfoPanel;
