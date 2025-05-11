import React from 'react';
import { BasePanel, FieldPanelContent } from './BasePanel';

interface FieldInfoPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onEnterCornGarden: () => void;
}

/**
 * FieldInfoPanel - Component hiển thị thông tin cánh đồng
 * Là một lính dưới quyền chỉ huy của BasePanel
 */
const FieldInfoPanel: React.FC<FieldInfoPanelProps> = ({ isVisible, onClose, onEnterCornGarden }) => {
  const description = (
    <>
      <p>Cánh đồng ngô đang phát triển tốt và sẵn sàng để thu hoạch. Bạn có thể vào vườn ngô để kiểm tra tình trạng cây trồng và thu hoạch khi chúng đã sẵn sàng.</p>
      <p><strong>Trạng thái:</strong> Sẵn sàng thu hoạch</p>
      <p><strong>Loại cây:</strong> Ngô hybrid cao sản</p>
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
        title="Cánh Đồng Ngô"
        description={description}
        fieldIcon="🌽"
        onClose={onClose}
        primaryAction={{
          label: "Vào Vườn Ngô",
          icon: "🌽",
          onClick: onEnterCornGarden
        }}
        secondaryAction={{
          label: "Đóng",
          onClick: onClose
        }}
      />
    </BasePanel>
  );
};

export default FieldInfoPanel;