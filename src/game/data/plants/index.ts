import { TreeInfo } from '../../types';
import { CornPlantConfig } from './corn';
import { CoffeePlantConfig } from './coffee';

/**
 * Định nghĩa interface cho cấu hình cây trồng
 */
export interface PlantConfig {
  type: string;
  label: string;
  icon: string;
  color: string;
  basePrice: number;
  growthStages?: Record<string, {
    days: number;
    yieldPercentage: number;
    statusText: string;
  }>;
  properties?: Record<string, string | number | boolean>;
  renderDetails: (plant: TreeInfo) => React.ReactNode | { __html: string };
}

/**
 * Định nghĩa type cho registry với index signature để tăng tính an toàn
 */
export type PlantRegistryType = {
  [key: string]: PlantConfig;
};

/**
 * Plant Registry - Đăng ký tất cả các loại cây trong hệ thống
 * Dễ dàng thêm loại cây mới bằng cách import và thêm vào đây
 */
export const PlantRegistry: PlantRegistryType = {
  corn: CornPlantConfig,
  coffee: CoffeePlantConfig,
  // Thêm các loại cây mới ở đây, ví dụ:
  // cherry: CherryPlantConfig,
  // apple: ApplePlantConfig, 
  // orange: OrangePlantConfig,
  // ...và nhiều loại cây khác
};

/**
 * Lấy thông tin cấu hình của một loại cây theo tên
 */
export const getPlantConfig = (type: string): PlantConfig => {
  if (!type || !PlantRegistry[type.toLowerCase()]) {
    // Trả về cấu hình mặc định nếu không tìm thấy loại cây
    return {
      type: 'unknown',
      label: 'Cây Không Xác Định',
      icon: '🌱',
      color: '#4caf50',
      basePrice: 5,
      renderDetails: () => null
    };
  }
  
  return PlantRegistry[type.toLowerCase()];
};
