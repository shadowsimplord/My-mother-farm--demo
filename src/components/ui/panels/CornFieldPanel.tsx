import React from 'react';
import { BasePanel, FieldPanelContent } from './BasePanel';

interface CornFieldPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onEnterCornGarden: () => void;
}

/**
 * CornFieldPanel - Component hiển thị thông tin cánh đồng ngô
 * Thiết kế theo phong cách của Canadian Dairy Farm Discovery website
 */
const CornFieldPanel: React.FC<CornFieldPanelProps> = ({ isVisible, onClose, onEnterCornGarden }) => {
  const description = (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#4a7e38] mb-2">Corn Field Information</h3>
        <p className="mb-3">This corn field is growing well and ready for harvest. The corn variety used here is a high-yield hybrid that's perfect for sustainable farming.</p>
      </div>
      <div className="text-sm text-gray-500 italic mt-2">
        Click the "Visit Corn Garden" button to inspect the crops up close and harvest when they're ready.
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
        title="Corn Field"
        description={description}
        fieldIcon="🌽"
        onClose={onClose}
        primaryAction={{
          label: "Visit Corn Garden",
          icon: "🌽",
          onClick: onEnterCornGarden
        }}
        secondaryAction={{
          label: "Close",
          onClick: onClose
        }}
      />
    </BasePanel>
  );
};

export default CornFieldPanel;