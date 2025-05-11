import { TreeInfo } from '../../types';

export interface TreeInfoExtended extends TreeInfo {
  owner?: string;
  leasePeriod?: string;
  health?: number;
  lastWatered?: string;
  harvestable?: boolean;
  fruitCount?: number;
}

export function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'good': return '#4CAF50';
    case 'normal': return '#00c3ff';
    case 'bad': return '#F44336';
    default: return '#9E9E9E';
  }
}

export function getStatusLabel(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'good': return '✅ Khỏe Mạnh';
    case 'normal': return ' Bình Thường';
    case 'bad': return '⚠️ Cần Chăm Sóc';
    default: return '❓ Không Xác Định';
  }
}

export function calculateYield(tree: TreeInfoExtended): number {
  const baseYield = tree.daysPlanted ?
    (tree.daysPlanted < 5 ? 0 :
      tree.daysPlanted < 10 ? 30 :
        tree.daysPlanted < 30 ? 70 : 100) : 0;

  switch (tree.status?.toLowerCase()) {
    case 'good': return baseYield;
    case 'normal': return Math.floor(baseYield * 0.8);
    case 'bad': return Math.floor(baseYield * 0.5);
    default: return baseYield;
  }
}

export function calculatePrice(tree: TreeInfoExtended): number {
  const basePrice = tree.type === 'cherry' ? 12 : 9;
  const yield_ = calculateYield(tree);
  const yieldFactor = yield_ / 100;
  return Math.round((basePrice * (0.7 + yieldFactor * 0.3)) * 10) / 10;
}

/**
 * enhancePlantInfo - Mở rộng thông tin cây trồng với dữ liệu bổ sung
 */
export function enhancePlantInfo(plant: TreeInfo): TreeInfoExtended {
  const newPlant = { ...plant } as TreeInfoExtended;
  
  // Add additional properties based on plant type
  newPlant.owner = 'MyMotherFarm';
  newPlant.leasePeriod = '12 tháng';
  newPlant.health = plant.status === 'good' ? 95 : plant.status === 'normal' ? 75 : 45;
  
  // Set last watered date (example)
  const today = new Date();
  newPlant.lastWatered = new Date(today.setDate(today.getDate() - 3)).toISOString();
  
  // Set harvestability
  newPlant.harvestable = plant.daysPlanted ? plant.daysPlanted > 10 : false;
  newPlant.fruitCount = plant.daysPlanted ? Math.floor(plant.daysPlanted / 3) : 0;
  
  return newPlant;
}

/**
 * safeCalculateYield - Tính năng suất với kiểm tra an toàn
 */
export function safeCalculateYield(plant: TreeInfo | TreeInfoExtended | null): number {
  if (!plant) return 0;
  return calculateYield(plant as TreeInfoExtended);
}

/**
 * safeCalculatePrice - Tính giá với kiểm tra an toàn
 */
export function safeCalculatePrice(plant: TreeInfo | TreeInfoExtended | null, basePrice?: number): number {
  if (!plant) return 0;
  if (basePrice) {
    const yield_ = calculateYield(plant as TreeInfoExtended);
    const yieldFactor = yield_ / 100;
    return Math.round((basePrice * (0.7 + yieldFactor * 0.3)) * 10) / 10;
  }
  return calculatePrice(plant as TreeInfoExtended);
}

/**
 * getHealthColorClass - Lấy class CSS màu dựa trên sức khỏe cây
 */
export function getHealthColorClass(health: number): string {
  if (health >= 80) return 'text-green-600';
  if (health >= 50) return 'text-yellow-600';
  return 'text-red-600';
}
