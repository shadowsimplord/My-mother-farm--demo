# Kiến Trúc Mới cho Farm Game 3D

## Tổng Quan

Kiến trúc mới được thiết kế theo mô hình "tướng-lính" để giảm thiểu code trùng lặp và tạo cấu trúc dễ mở rộng, đặc biệt là cho việc thêm nhiều loại cây trồng trong tương lai.

Kiến trúc hỗ trợ hai cách tiếp cận bổ sung cho nhau:
1. **Factory Pattern**: Tạo nhanh các panel thông qua `createPlantPanel(type)` cho các cây đơn giản 
2. **Component Chuyên Biệt**: Tạo các file riêng (như `CornPlantInfoPanel.tsx`, `CoffeePlantPanel.tsx`...) cho các loại cây cần xử lý đặc biệt

Cả hai cách đều sử dụng chung hệ thống cấu hình từ thư mục `plants/` và đều kế thừa từ `BasePanel`, đảm bảo tính nhất quán và dễ bảo trì.

## Cấu Trúc Thư Mục

```
src/
  components/
    ui/
      panels/
        BasePanel.tsx      # "Tướng quân" chung cho tất cả các panel, bao gồm các component con
        PanelFactory.ts    # Factory functions để tạo panel mới một cách dễ dàng
        [Specific]Panel.tsx # Các "lính" cụ thể
  game/
    data/
      plants/             # Thư mục chứa cấu hình cho từng loại cây
        index.ts         # Hệ thống đăng ký cây trồng
        corn.tsx         # Cấu hình cho cây ngô
        coffee.tsx       # Cấu hình cho cây cà phê
        [other].tsx      # Cấu hình cho các loại cây khác
    utils/
      helpers/
        treeInfoHelpers.ts # Các hàm tiện ích cho cây trồng
```

## Hướng Dẫn Thêm Loại Cây Mới

### Bước 1: Tạo File Cấu Hình

Tạo file mới trong thư mục `src/game/data/plants/` (ví dụ: `cherry.tsx`):

```tsx
import React from 'react';
import { TreeInfo } from '../../../types';

export const CherryPlantConfig = {
  type: 'cherry',
  label: 'Cây Anh Đào',
  icon: '🍒',
  color: '#C2185B',
  basePrice: 15,
  
  growthStages: {
    seedling: { days: 0, yieldPercentage: 0, statusText: 'Cây Con' },
    young: { days: 5, yieldPercentage: 0, statusText: 'Cây Non' },
    growing: { days: 15, yieldPercentage: 50, statusText: 'Đang Phát Triển' },
    mature: { days: 30, yieldPercentage: 100, statusText: 'Trưởng Thành' },
  },
  
  properties: {
    waterNeeds: 'high',
    sunNeeds: 'medium',
    harvestInterval: 10,
  },
  
  renderDetails: (plant: TreeInfo) => (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-gray-500">Đặc tính:</span>
        <span className="font-medium">Quả Ngọt</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Mùa thu hoạch:</span>
        <span className="font-medium">Mùa Hè</span>
      </div>
    </div>
  )
};
```

### Bước 2: Đăng Ký Cây Mới

Thêm vào file `src/game/data/plants/index.ts`:

```ts
export const PlantRegistry: PlantRegistryType = {
  corn: CornPlantConfig,
  coffee: CoffeePlantConfig,
  cherry: CherryPlantConfig, // Thêm cây mới vào đây
};
```

### Bước 3: Tạo Panel Cho Cây Mới

Có hai cách để tạo panel cho loại cây mới:

#### Cách 1: Sử dụng Factory (đơn giản, nhanh chóng)
Sử dụng khi cây không cần hiệu ứng hoặc hiển thị đặc biệt:

```ts
import { createPlantPanel } from '../components/ui/panels/PanelFactory';

// Tạo và export component
export const CherryPlantPanel = createPlantPanel('cherry');

// Hoặc sử dụng trực tiếp
<PlantPanel plant={selectedTree} onClose={handleClose} />
```

#### Cách 2: Tạo Panel Riêng (tùy biến cao)
Sử dụng khi cây cần xử lý đặc biệt (như cây ngô, cây khoai, sầu riêng...):

```tsx
// Tạo file CherryPlantInfoPanel.tsx
import React from 'react';
import { TreeInfo } from '../../../game/types';
import { BasePanel, PlantPanelContent } from './BasePanel';
import { getPlantConfig } from '../../../game/data/plants';

const CherryPlantInfoPanel: React.FC<{plant: TreeInfo | null; onClose: () => void}> = ({ plant, onClose }) => {
  if (!plant) return null;
  
  const plantType = "cherry";
  const plantConfig = getPlantConfig(plantType);
  
  // Thêm logic xử lý đặc biệt cho cây cherry ở đây
  
  return (
    <BasePanel isVisible={true} onClose={onClose} overlayPosition="topRight">
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

export default CherryPlantInfoPanel;
```

## Ưu Điểm của Kiến Trúc Mới

1. **Giảm Code Trùng Lặp**: Mọi panel đều thừa kế từ BasePanel.
2. **Dễ Mở Rộng**: Thêm loại cây mới chỉ cần tạo file cấu hình.
3. **Tách Biệt Dữ Liệu và UI**: Cấu hình cây được tách riêng khỏi UI.
4. **Hệ Thống Đăng Ký Tập Trung**: Quản lý tất cả loại cây tại một nơi.
5. **Linh Hoạt Trong Triển Khai**: Hỗ trợ cả hai cách tiếp cận:
   - Sử dụng factory nhanh chóng cho các cây đơn giản
   - Tạo component riêng cho các cây có tính năng đặc biệt
6. **Dễ Bảo Trì**: Logic chung được tập trung trong BasePanel, các xử lý đặc thù được cô lập trong từng file riêng.

## Dọn Dẹp

Các file sau đã được xóa vì chức năng của chúng đã được tích hợp vào hệ thống mới:
- `BasePlantInfoPanel.tsx`
- `plantDisplayHelpers.tsx`
- `plantPanelHelpers.ts`
