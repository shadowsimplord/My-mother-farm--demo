import { TreeInfo } from '../../types';

/**
 * CoffeePlantConfig - Cấu hình chi tiết cho cây cà phê
 * Tương tự như cấu trúc cây ngô, nhưng với thuộc tính riêng
 */
export const CoffeePlantConfig = {
  type: 'coffee',
  label: 'Cây Cà Phê',
  icon: '☕',
  color: '#795548',
  basePrice: 10,
  growthStages: {
    seedling: {
      days: 0,
      yieldPercentage: 0,
      statusText: '🌱 Cây Mầm'
    },
    young: {
      days: 10,
      yieldPercentage: 0,
      statusText: '🌱 Cây Non'
    },
    growing: {
      days: 30,
      yieldPercentage: 40,
      statusText: '📈 Đang Phát Triển'
    },
    flowering: {
      days: 60,
      yieldPercentage: 70,
      statusText: '🌸 Đang Ra Hoa'
    },
    mature: {
      days: 120,
      yieldPercentage: 100,
      statusText: '✅ Trưởng Thành'
    },
  },
  
  // Các thuộc tính riêng của cây cà phê
  properties: {
    harvestTime: '3-4 năm (đầy đủ)',
    coffeeType: 'Arabica',
    altitude: '800-1200m',
    yieldAmount: '2-5kg hạt/năm'
  },
    // HTML template cho phần chi tiết cây
  renderDetails: (plant: TreeInfo | null) => {
    // Sử dụng template string thay vì JSX để tránh phải import React
    const id = plant?.id || 'N/A';
    const showId = plant?.position ? 
      `<p class="m-0 mt-2 text-gray-500">ID: ${id}</p>` : '';
      
    return {
      __html: `
        <div class="bg-[#f0e6e2] rounded-lg p-3 mt-3">
          <h3 class="m-0 mb-2 text-base font-medium text-gray-800">
            Đặc điểm cây cà phê
          </h3>
          <div class="text-sm">
            <p class="m-0 mb-2">
              <strong>Loại hạt:</strong> Arabica
            </p>
            <p class="m-0 mb-2">
              <strong>Độ cao:</strong> 800-1200m
            </p>
            <p class="m-0 mb-2">
              <strong>Thu hoạch:</strong> 3-4 năm
            </p>
            <p class="m-0">
              <strong>Sản lượng:</strong> 2-5kg hạt/năm
            </p>
            ${showId}
          </div>
        </div>
      `
    };
  }
};
