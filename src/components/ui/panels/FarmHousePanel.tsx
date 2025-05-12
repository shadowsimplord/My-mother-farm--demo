import React from 'react';
import { BasePanel, FieldPanelContent } from './BasePanel';

interface FarmHousePanelProps {
  isVisible: boolean;
  onClose: () => void;
  onEnterHouse?: () => void;
}

/**
 * FarmHousePanel - Component hiển thị thông tin về ngôi nhà trang trại
 */
const FarmHousePanel: React.FC<FarmHousePanelProps> = ({ isVisible, onClose, onEnterHouse }) => {
  const description = (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#8B4513] mb-2">Farm House Information</h3>
        <p className="mb-3">Welcome to the main farm house! This is where the farm owner lives and manages daily operations of the farm.</p>
        <p className="mb-3">The house features traditional architecture with modern amenities, providing comfort while maintaining the rustic farm aesthetic.</p>
      </div>
      <div className="text-sm text-gray-500 italic mt-2">
        Click the "Enter House" button to explore the interior and access farm management options.
      </div>
    </>
  );

  return (
    <BasePanel 
      isVisible={isVisible} 
      onClose={onClose}
      overlayPosition="center"
    >
      <FieldPanelContent
        isVisible={isVisible}
        title="Farm House"
        description={description}
        fieldIcon="🏡"
        onClose={onClose}
        primaryAction={{
          label: "Enter House",
          icon: "🏡",
          onClick: onEnterHouse || onClose
        }}
        secondaryAction={{
          label: "Close",
          onClick: onClose
        }}
      />
    </BasePanel>
  );
};

export default FarmHousePanel;
