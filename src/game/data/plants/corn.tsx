import { TreeInfo } from '../../types';

/**
 * CornPlantConfig - Cấu hình chi tiết cho cây ngô
 * Dễ dàng chỉnh sửa hoặc thêm thuộc tính mới ở đây
 */
export const CornPlantConfig = {
  type: 'corn',
  label: 'Cây Ngô',
  icon: '🌽',
  color: '#f0c000',
  basePrice: 5,
  growthStages: {
    seedling: {
      days: 0,
      yieldPercentage: 0,
      statusText: '🌱 Cây Mầm'
    },
    young: {
      days: 5,
      yieldPercentage: 30,
      statusText: '🌱 Cây Non'
    },
    growing: {
      days: 10,
      yieldPercentage: 70,
      statusText: '📈 Đang Phát Triển'
    },
    mature: {
      days: 14,
      yieldPercentage: 100,
      statusText: '✅ Trưởng Thành'
    },
  },
  
  // Các thuộc tính riêng của cây ngô
  properties: {
    harvestTime: '3-4 tháng',
    season: 'Xuân - Hè',
    yieldAmount: '5-8 bắp/cây'
  },
    // HTML template cho phần chi tiết cây
  renderDetails: (plant: TreeInfo | null) => {
    // Sử dụng template string thay vì JSX để tránh phải import React
    const id = plant?.id || 'N/A';
    const showId = plant?.position ? 
      `<p class="m-0 mt-2 text-gray-500">ID: ${id}</p>` : '';
      
    return {
      __html: `
        <div class="bg-[#f8f8e0] rounded-lg p-3 mt-3">
          <h3 class="m-0 mb-2 text-base font-medium text-gray-800">
            Đặc điểm cây ngô
          </h3>
          <div class="text-sm">
            <p class="m-0 mb-2">
              <strong>Thời vụ:</strong> Xuân - Hè
            </p>
            <p class="m-0 mb-2">
              <strong>Thu hoạch:</strong> 3-4 tháng
            </p>
            <p class="m-0">
              <strong>Sản lượng:</strong> 5-8 bắp/cây
            </p>
            ${showId}
          </div>
        </div>
      `
    };
  }
};
