# HƯỚNG DẪN SỬ DỤNG CÁC COMPONENT NHÀ NÔNG TRẠI

## 1. FarmBuildings
- FarmBuildings là container cho tất cả các tòa nhà trong trò chơi
- Để thêm một tòa nhà mới, thêm component tương ứng trong FarmBuildings.tsx
- Xem ví dụ:

```tsx
<FarmHouse 
  position={[x, y, z]}
  scale={0.005}
  rotation={[0, Math.PI / 2, 0]} 
  onClick={() => handleClick('farmhouse', 'main_house')}
/>
```

## 2. FarmHouse
- FarmHouse là component cho ngôi nhà nông trại
- Props:
  - position: [x, y, z] - vị trí trong thế giới 3D
  - rotation?: [x, y, z] - góc xoay (radian)
  - scale?: number - tỉ lệ kích thước (khuyến nghị: 0.005)
  - onClick?: callback - xử lý khi click vào nhà

## 3. FarmHousePanel
- Panel hiển thị thông tin và tương tác với ngôi nhà
- Được hiển thị khi:
  - Người chơi click vào nhà
  - Click vào navigation marker trên nhà
  - Gọi `window.farmUI.showPanel('house')`
  
## 4. Navigation
- Navigation marker được cấu hình trong NavigationMarkers.tsx
- Vị trí và hiển thị marker nhà:
```tsx
house: {
  heightOffset: 3.5,
  markerSize: 1.8,
  color: '#8B4513',  // Brown color for house
  useSpecialPosition: true,
  position: [2, 3.5, 3]  // Đặt icon trên ngôi nhà
}
```

## 5. Camera Viewpoints
- Góc camera cho ngôi nhà được định nghĩa trong CameraController.tsx:
```tsx
{
  id: 'house',
  position: [5, 3, 5],
  target: [2, 0, 3],
  name: 'Ngôi nhà',
  description: 'Thăm quan ngôi nhà trang trại'
}
  - onClick?: (event) => void - hàm xử lý khi click
  - onHover?: (isHovering: boolean) => void - hàm xử lý khi hover

3. TỐI ƯU HIỆU SUẤT
------------------
- Đã cài đặt tối ưu cơ bản cho bóng đổ
- Để tối ưu thêm cho nhiều tòa nhà, bạn có thể:
  a) Sử dụng LOD (Level of Detail) dựa trên khoảng cách
  b) Tắt bóng đổ cho đối tượng xa camera
  c) Sử dụng Instanced Rendering khi có nhiều tòa nhà giống nhau
  d) Tham khảo file 'farm-house-optimization-guide.js'

4. THÊM TƯƠNG TÁC VÀ ANIMATION
------------------------------
- Có thể thêm animation khi click vào nhà
- Ví dụ: hiển thị UI, zoom camera vào nhà, v.v.
- Xử lý trong SceneInteractionHelper.tsx tương tự như với CornField
*/

// Mẫu code để tạo hiệu ứng glow khi hover
/*
import { useFrame } from '@react-three/fiber'

// Trong component
const [glowIntensity, setGlowIntensity] = useState(0)

// Trong useFrame
useFrame(() => {
  if (isHovered && glowIntensity < 1) {
    setGlowIntensity(Math.min(glowIntensity + 0.05, 1))
  } else if (!isHovered && glowIntensity > 0) {
    setGlowIntensity(Math.max(glowIntensity - 0.05, 0))
  }
})

// Trong mesh material
emissive={new THREE.Color(0x555555)}
emissiveIntensity={glowIntensity}
*/
