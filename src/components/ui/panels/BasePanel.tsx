import React from 'react';
import { TreeInfo } from '../../../game/types';
import { 
  // TreeInfoExtended not directly used in this file
  getStatusColor, 
  getStatusLabel,
  enhancePlantInfo,
  safeCalculateYield,
  safeCalculatePrice,
  getHealthColorClass
} from '../../../game/utils/helpers/treeInfoHelpers';
import { getPlantConfig } from '../../../game/data/plants';

/**
 * BasePanelProps - Interface cho các props của BasePanel
 * Thiết kế để dễ dàng mở rộng và tương thích với nhiều loại panel
 */
export interface BasePanelProps {
  isVisible: boolean;
  onClose: () => void;
  overlayPosition?: 'center' | 'topRight' | 'topLeft';
  customStyle?: React.CSSProperties;
}

/**
 * BasePlantPanelProps - Interface mở rộng cho các plant panel
 */
export interface BasePlantPanelProps extends BasePanelProps {
  plant: TreeInfo | null;
  plantType: string;
  plantLabel: string;
  basePrice?: number;
  iconEmoji?: string;
  customColor?: string;
  customDetails?: { __html: string } | React.ReactNode;
}

/**
 * BaseFieldPanelProps - Interface mở rộng cho các field panel
 */
export interface BaseFieldPanelProps extends BasePanelProps {
  title: string;
  description: React.ReactNode;
  fieldIcon?: string;
  primaryAction?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * BasePanel - Component gốc cho tất cả loại panel khác
 * Phần này chỉ xử lý việc hiển thị khung chung với một overlay mờ
 */
export const BasePanel: React.FC<BasePanelProps & { children: React.ReactNode }> = ({
  isVisible,
  onClose,
  children,
  overlayPosition = 'center',
  customStyle
}) => {
  if (!isVisible) return null;

  const positionClass = overlayPosition === 'center' 
    ? 'fixed inset-0 flex justify-center items-center' 
    : overlayPosition === 'topRight'
      ? 'fixed top-4 right-4'
      : 'fixed top-4 left-4';

  return (
    <div 
      className={`${positionClass} z-[1000] ${overlayPosition === 'center' ? 'bg-black/50 backdrop-blur-sm' : ''}`}
      onClick={overlayPosition === 'center' ? onClose : undefined}
    >
      <div 
        className="relative"
        onClick={overlayPosition === 'center' ? (e) => e.stopPropagation() : undefined}
        style={{
          animation: overlayPosition === 'center' ? "fadeIn 0.3s ease-out" : undefined,
          ...customStyle
        }}
      >
        {children}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

/**
 * PlantPanelContent - Component chuẩn để hiển thị thông tin cây
 * Được sử dụng bởi tất cả các panel cây cụ thể (CornPanel, CoffeePanel, v.v.)
 */
export const PlantPanelContent: React.FC<BasePlantPanelProps> = ({
  plant,
  plantType,
  plantLabel,
  basePrice,
  iconEmoji = '🌱',
  customColor = '#4CAF50',
  customDetails,
  onClose
}) => {  if (!plant) return null;
  
  // Enhance plant information
  const enhancedPlant = enhancePlantInfo(plant);
  
  // Calculate important values
  const plantYield = safeCalculateYield(enhancedPlant);
  const plantPrice = safeCalculatePrice(enhancedPlant, basePrice);
  const statusColor = getStatusColor(enhancedPlant?.status);
  
  return (
    <div className="w-[350px] bg-gradient-to-b from-[#f8f8f8] to-[#e8e8e8] rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex justify-between items-center py-3 px-4 text-white shadow-md"
        style={{ backgroundColor: customColor }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{iconEmoji}</span>
          <h3 className="text-lg font-bold m-0 capitalize">
            {plantLabel} {plant.id?.replace(plantType, '') || ''}
          </h3>
        </div>
        <button 
          className="bg-transparent border-none text-white text-xl leading-none hover:opacity-70 transition-opacity cursor-pointer"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Status Section */}
        <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
          <span className="font-medium text-gray-700">Trạng thái:</span>
          <div className="flex items-center gap-1.5">
            <span 
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: statusColor }}
            ></span>
            <span className="font-medium" style={{ color: statusColor }}>
              {getStatusLabel(enhancedPlant?.status)}
            </span>
          </div>
        </div>
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          {/* Left Column */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Tuổi cây</div>
            <div className="font-medium">
              {plant.daysPlanted || 0} ngày
            </div>
          </div>
          
          {/* Right Column */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Năng suất</div>
            <div className="font-medium flex items-center">
              <div 
                className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden mr-2"
              >
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${plantYield}%`,
                    backgroundColor: customColor 
                  }}
                ></div>
              </div>
              <span>{plantYield}%</span>
            </div>
          </div>
          
          {/* Health Section */}
          {enhancedPlant?.health !== undefined && (
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Sức khỏe</div>
              <div className="font-medium flex items-center">
                <div 
                  className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden mr-2"
                >
                  <div 
                    className={`h-full rounded-full ${getHealthColorClass(enhancedPlant.health)}`}
                    style={{ width: `${enhancedPlant.health}%` }}
                  ></div>
                </div>
                <span>{enhancedPlant.health}%</span>
              </div>
            </div>
          )}
          
          {/* Location Section */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Vị trí</div>
            <div className="font-medium text-sm">
              [{plant.position?.map(p => Math.round(p * 100) / 100).join(', ')}]
            </div>
          </div>
        </div>        {/* Custom Details */}
        {customDetails && (
          <div className="bg-white p-3 rounded-lg shadow-sm mt-1">
            {typeof customDetails === 'object' && '__html' in customDetails 
              ? <div dangerouslySetInnerHTML={customDetails as { __html: string }} />
              : customDetails
            }
          </div>
        )}

        {/* Last Watered Info */}
        {enhancedPlant?.lastWatered && (
          <div className="bg-white p-3 rounded-lg shadow-sm mt-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Lần cuối tưới nước:</span>
              <span className="text-sm font-medium">{
                typeof enhancedPlant.lastWatered === 'string' 
                  ? new Date(enhancedPlant.lastWatered).toLocaleDateString('vi-VN')
                  : enhancedPlant.lastWatered
              }</span>
            </div>
          </div>
        )}

        {/* NFT Info */}
        <div className="bg-gray-100 p-3 rounded-lg shadow-sm mt-1">
          <h3 className="text-base font-medium text-gray-800 m-0 mb-2">Thông tin NFT</h3>
          <div className="text-sm">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-gray-500">Chủ sở hữu:</span>
              <span className="font-medium text-blue-600">
                {enhancedPlant?.owner || 'MyMotherFarm'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-gray-500">Giá thuê:</span>
              <span className="font-medium" style={{ color: customColor }}>
                {plantPrice} USDT/tháng
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Thời hạn:</span>
              <span className="font-medium">
                {enhancedPlant?.leasePeriod || '12 tháng'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <button 
            className="flex-1 py-2.5 px-4 text-white border-none rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 hover:opacity-90"
            style={{ backgroundColor: customColor }}
          >
            Thuê Cây
          </button>
          <button 
            className="flex-1 py-2.5 px-4 bg-farm-amber text-white border-none rounded-lg font-medium cursor-pointer hover:bg-[#e68a00] transition-colors flex items-center justify-center gap-2"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * FieldPanelContent - Component chuẩn để hiển thị thông tin cánh đồng
 * Được sử dụng bởi tất cả các field panel cụ thể (CornField, CoffeeField, v.v.)
 */
export const FieldPanelContent: React.FC<BaseFieldPanelProps> = ({
  title,
  description,
  fieldIcon,
  primaryAction,
  secondaryAction,
  onClose
}) => {
  return (
    <div className="bg-gradient-to-b from-[#f8f8f8] to-[#e8e8e8] rounded-xl p-6 w-[450px] shadow-xl flex flex-col gap-4 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-farm-dark-green m-0">{title}</h2>
        <button 
          className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 p-1 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      {fieldIcon && (
        <div className="w-full h-[150px] rounded-lg mb-4 bg-gray-100">
          <div className="w-full h-full flex justify-center items-center bg-[#e0f2e0] text-5xl">
            {fieldIcon}
          </div>
        </div>
      )}
      
      <div className="text-base leading-relaxed text-gray-700 mb-2">
        {description}
      </div>
      
      <div className="flex gap-2.5 justify-center mt-4">
        {primaryAction && (
          <button 
            className="py-3 px-6 bg-farm-green text-white border-none rounded-lg cursor-pointer text-base font-bold flex items-center gap-2 transition-all duration-200 hover:bg-[#45a049] hover:-translate-y-0.5"
            onClick={primaryAction.onClick}
          >
            {primaryAction.icon && <span>{primaryAction.icon}</span>}
            {primaryAction.label}
          </button>
        )}
        
        {secondaryAction && (
          <button 
            className="py-3 px-6 bg-transparent text-farm-green border border-farm-green rounded-lg cursor-pointer text-base font-bold flex items-center gap-2 transition-all duration-200 hover:bg-[#f0fff0] hover:-translate-y-0.5"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>  );
};

/**
 * PlantPanel - Component thông minh để hiển thị thông tin bất kỳ loại cây nào
 * Tự động lấy thông tin cấu hình từ plant registry
 */
export interface PlantPanelProps {
  plant: TreeInfo | null;
  onClose: () => void;
  position?: 'topRight' | 'topLeft' | 'center';
}

export const PlantPanel: React.FC<PlantPanelProps> = ({ 
  plant, 
  onClose,
  position = 'topRight'
}) => {
  if (!plant || !plant.type) return null;
  
  // Lấy cấu hình dựa trên loại cây
  const plantConfig = getPlantConfig(plant.type);
  
  return (
    <BasePanel 
      isVisible={true} 
      onClose={onClose} 
      overlayPosition={position}
    >
      <PlantPanelContent
        isVisible={true}
        plant={plant}
        onClose={onClose}
        plantType={plant.type}
        plantLabel={plantConfig.label}
        basePrice={plantConfig.basePrice}
        iconEmoji={plantConfig.icon}
        customColor={plantConfig.color}
        customDetails={plantConfig.renderDetails(plant)}
      />
    </BasePanel>
  );
};

// Factory functions và các panel được tạo sẵn đã chuyển sang file PanelFactory.ts

export default BasePanel;
