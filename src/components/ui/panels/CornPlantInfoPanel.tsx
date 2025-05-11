import React from 'react';
import { TreeInfo } from '../../../game/types';
import { BasePanel, PlantPanelContent } from './BasePanel';
import { getPlantConfig } from '../../../game/data/plants';

interface CornPlantInfoPanelProps {
  plant: TreeInfo | null;
  onClose: () => void;
}

/**
 * CornPlantInfoPanel - Component hiển thị thông tin cây ngô
 * Là một lính dưới quyền chỉ huy của BasePanel
 * Sử dụng cấu hình từ hệ thống đăng ký cây
 */
const CornPlantInfoPanel: React.FC<CornPlantInfoPanelProps> = ({ plant, onClose }) => {
  if (!plant) return null;
  
  // Sử dụng thông tin từ hệ thống đăng ký cây
  const plantType = "corn";
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

export default CornPlantInfoPanel;