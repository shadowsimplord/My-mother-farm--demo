import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createNoise2D } from 'simplex-noise';

// Các tham số địa hình
const GRID_SIZE = 50; // Kích thước lưới
const GRID_RESOLUTION = 100; // Số lượng phân đoạn
const HEIGHT_MULTIPLIER = 2.5; // Hệ số nhân chiều cao
const NOISE_SCALE = 0.1; // Tỉ lệ noise

// Component Terrain
const Terrain = React.forwardRef<THREE.Mesh>((props, ref) => {
  // Tạo noise
  const noise2D = useMemo(() => createNoise2D(), []);
  
  // Tạo geometry cho địa hình
  const geometry = useMemo(() => {
    const planeGeometry = new THREE.PlaneGeometry(
      GRID_SIZE, 
      GRID_SIZE,
      GRID_RESOLUTION,
      GRID_RESOLUTION
    );
    
    // Tạo heightmap sử dụng simplex noise
    const { position } = planeGeometry.attributes;
    const vertex = new THREE.Vector3();
    
    // Áp dụng noise và tạo một heightmap thực tế
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      
      const x = vertex.x / GRID_SIZE;
      const y = vertex.y / GRID_SIZE;
      
      // Tạo nhiều lớp noise ở các tần số khác nhau để tạo địa hình tự nhiên
      const elevation = 
        1.00 * noise2D(x * NOISE_SCALE * 1.0, y * NOISE_SCALE * 1.0) +
        0.50 * noise2D(x * NOISE_SCALE * 2.0, y * NOISE_SCALE * 2.0) +
        0.25 * noise2D(x * NOISE_SCALE * 4.0, y * NOISE_SCALE * 4.0) +
        0.13 * noise2D(x * NOISE_SCALE * 8.0, y * NOISE_SCALE * 8.0);
      
      // Áp dụng độ cao
      vertex.z = elevation * HEIGHT_MULTIPLIER;
      
      // Tạo khu vực bằng phẳng ở giữa (cho khu vực trồng trọt)
      const distanceFromCenter = Math.sqrt(x * x + y * y) * 2.0;
      const flattenFactor = 1.0 - Math.max(0, 1 - distanceFromCenter);
      
      // Làm phẳng khu vực trung tâm
      vertex.z *= flattenFactor;
      
      // Cập nhật vị trí
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // Tính toán normal mới do địa hình đã thay đổi
    planeGeometry.computeVertexNormals();
    
    return planeGeometry;
  }, [noise2D]);
  
  // Animation và update terrain
  const materialRef = useRef(null);
  
  // Sử dụng useFrame để animation nếu cần
  useFrame((_state, _delta) => {
    // Animation code nếu cần thiết
  });
  
  // Render terrain mesh
  return (
    <mesh 
      ref={ref}
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
      castShadow
    >
      <meshStandardMaterial 
        color="#3a7c40" // Màu xanh lá cây
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
});

export default Terrain;