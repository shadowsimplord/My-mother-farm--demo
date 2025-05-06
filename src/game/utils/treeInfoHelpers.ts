import { TreeInfo } from '../types';

export interface TreeInfoExtended extends TreeInfo {
  owner?: string;
  leasePeriod?: string;
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
