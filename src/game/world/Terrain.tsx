import React, { useRef, useMemo, useState, useEffect, memo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { createNoise2D } from 'simplex-noise';

// Các tham số địa hình
const GRID_SIZE = 50; // Kích thước lưới
const GRID_RESOLUTION = 100; // Số lượng phân đoạn
const HEIGHT_MULTIPLIER = 2; // Hệ số nhân chiều cao (tăng lên để địa hình cao hơn)
const NOISE_SCALE = 0.12; // Tỉ lệ noise (tăng lên cho địa hình nhấp nhô nhiều hơn)2

// Tham số điều chỉnh địa hình
const NOISE_OCTAVES = 4; // Số lớp noise chồng lên nhau
const NOISE_PERSISTENCE = 0.6; // Độ bền của các octave (0-1)
const NOISE_LACUNARITY = 2.0; // Tần số giữa các octave
const HILLS_STRENGTH = [1.0, 0.6, 0.3, 0.15]; // Cường độ của mỗi lớp đồi (octave)

// Tham số làm mịn địa hình
const SMOOTHING_PASSES = 3; // Số lần áp dụng thuật toán làm mịn
const SMOOTHING_FACTOR = 0.77; // Cường độ làm mịn (0-1)
const EDGE_ROUNDNESS = 0.85; // Mức độ bo tròn cạnh (0-1)
const TRANSITION_SMOOTHNESS = 1.5; // Mức độ mượt của chuyển tiếp giữa các cao độ

// Đường dẫn đến heightmap
const HEIGHTMAP_PATH = '/images/Heightmap.png';

// Interface cho props
interface TerrainProps {
  onClick?: (event: THREE.Event) => void;
  useHeightmap?: boolean; // Thêm prop để chọn sử dụng heightmap hay noise
}

// Component Terrain
const Terrain = React.forwardRef<THREE.Mesh, TerrainProps>(({ onClick, useHeightmap = true }, ref) => {
  // Tạo noise
  const noise2D = useMemo(() => createNoise2D(), []);
  
  // Load heightmap texture
  const heightmapTexture = useLoader(THREE.TextureLoader, HEIGHTMAP_PATH);
  
  // Cache heightmap data
  const [heightmapData, setHeightmapData] = useState<number[][]>([]);
  
  // Extract heightmap data once the texture is loaded
  useEffect(() => {
    if (heightmapTexture && heightmapTexture.image) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      
      const width = heightmapTexture.image.width;
      const height = heightmapTexture.image.height;
      canvas.width = width;
      canvas.height = height;
      
      context.drawImage(heightmapTexture.image, 0, 0);
      
      const imageData = context.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      const heightData: number[][] = [];
      
      // Extract height data from the image
      for (let y = 0; y < height; y++) {
        heightData[y] = [];
        for (let x = 0; x < width; x++) {
          // Get red channel value (0-255) and normalize to [-1, 1]
          const index = (y * width + x) * 4;
          heightData[y][x] = (data[index] / 255) * 2 - 1;
        }
      }
      
      // Apply smoothing passes to the heightmap data
      const smoothedData = smoothHeightmapData(heightData, width, height);
      setHeightmapData(smoothedData);
    }
  }, [heightmapTexture]);
  
  // Smoothing function for heightmap data
  const smoothHeightmapData = (data: number[][], width: number, height: number): number[][] => {
    // Create a copy of the data to avoid modifying the original
    let result = JSON.parse(JSON.stringify(data));
    
    // Apply multiple smoothing passes
    for (let pass = 0; pass < SMOOTHING_PASSES; pass++) {
      const tempData = JSON.parse(JSON.stringify(result));
      
      // Apply smoothing kernel to each point
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          // Get surrounding height values
          const center = result[y][x];
          const left = result[y][x - 1];
          const right = result[y][x + 1];
          const top = result[y - 1][x];
          const bottom = result[y + 1][x];
          
          // Calculate corner values
          const topLeft = result[y - 1][x - 1];
          const topRight = result[y - 1][x + 1];
          const bottomLeft = result[y + 1][x - 1];
          const bottomRight = result[y + 1][x + 1];
          
          // Weight for corners (diagonal neighbors)
          const cornerWeight = EDGE_ROUNDNESS * 0.5;
          
          // Apply weighted average
          tempData[y][x] = (
            center * (1 - SMOOTHING_FACTOR) + 
            (left + right + top + bottom) * (SMOOTHING_FACTOR / 4) +
            (topLeft + topRight + bottomLeft + bottomRight) * (cornerWeight / 4)
          );
          
          // Apply additional smoothing to height transitions
          const heightDifference = Math.max(
            Math.abs(center - left),
            Math.abs(center - right),
            Math.abs(center - top),
            Math.abs(center - bottom)
          );
          
          // Apply extra smoothing for sharp transitions
          if (heightDifference > 0.2) {
            const transitionFactor = Math.min(1.0, heightDifference * TRANSITION_SMOOTHNESS);
            tempData[y][x] = center * (1 - transitionFactor * 0.4) + tempData[y][x] * (transitionFactor * 0.4);
          }
        }
      }
      
      result = tempData;
    }
    
    return result;
  };
  
  // Hàm nội suy để lấy độ cao từ heightmap data
  const getHeightFromHeightmap = (u: number, v: number): number => {
    if (heightmapData.length === 0) return 0;
    
    const width = heightmapData[0].length;
    const height = heightmapData.length;
    
    // Chuyển đổi u, v (0-1) sang tọa độ mảng
    const x = u * (width - 1);
    const y = v * (height - 1);
    
    // Get integer coordinates for bilinear interpolation
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);
    
    // Calculate interpolation factors
    const sx = x - x0;
    const sy = y - y0;
    
    // Bilinear interpolation between corner values
    const h00 = heightmapData[y0][x0];
    const h01 = heightmapData[y0][x1];
    const h10 = heightmapData[y1][x0];
    const h11 = heightmapData[y1][x1];
    
    // Perform bilinear interpolation
    const h0 = h00 * (1 - sx) + h01 * sx;
    const h1 = h10 * (1 - sx) + h11 * sx;
    
    return h0 * (1 - sy) + h1 * sy;
  };
  
  // Hàm tạo giá trị noise với nhiều octave
  const getNoiseValue = (x: number, y: number): number => {
    let amplitude = 1.0;
    let frequency = 1.0;
    let noiseValue = 0;
    let amplitudeSum = 0;
    
    // Tạo nhiều lớp noise chồng lên với tần số và biên độ khác nhau
    for (let i = 0; i < NOISE_OCTAVES; i++) {
      const noiseX = x * frequency * NOISE_SCALE;
      const noiseY = y * frequency * NOISE_SCALE;
      
      // Thêm layer noise với cường độ giảm dần
      noiseValue += HILLS_STRENGTH[i % HILLS_STRENGTH.length] * amplitude * noise2D(noiseX, noiseY);
      
      amplitudeSum += amplitude;
      amplitude *= NOISE_PERSISTENCE;
      frequency *= NOISE_LACUNARITY;
    }
    
    // Chuẩn hóa về khoảng -1 đến 1
    return noiseValue / amplitudeSum;
  };
  
  // Tạo geometry cho địa hình - OPTIMIZED: chỉ tạo mặt trên
  const geometry = useMemo(() => {
    // Tạo heightmap bằng PlaneGeometry
    const planeGeometry = new THREE.PlaneGeometry(
      GRID_SIZE, 
      GRID_SIZE,
      GRID_RESOLUTION,
      GRID_RESOLUTION
    );
    
    // Tạo heightmap sử dụng heightmap image hoặc noise
    const { position } = planeGeometry.attributes;
    const vertex = new THREE.Vector3();
    
    // Áp dụng chiều cao cho mỗi đỉnh dựa trên heightmap hoặc noise
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      
      const x = vertex.x / GRID_SIZE;
      const y = vertex.y / GRID_SIZE;
      
      // Chuyển đổi từ khoảng [-0.5, 0.5] sang [0, 1] cho texture sampling
      const u = x + 0.5;
      const v = y + 0.5;
      
      // Lấy độ cao từ heightmap hoặc noise
      let elevation;
      if (useHeightmap && heightmapData.length > 0) {
        elevation = getHeightFromHeightmap(u, v);
      } else {
        elevation = getNoiseValue(x, y);
      }
      
      // Áp dụng độ cao
      vertex.z = elevation * HEIGHT_MULTIPLIER;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // Tính toán normal mới do địa hình đã thay đổi
    planeGeometry.computeVertexNormals();
    
    return planeGeometry;
  }, [noise2D, useHeightmap, heightmapData, getHeightFromHeightmap, getNoiseValue]);
  
  // Animation và update terrain
  const materialRef = useRef(null);
  
  // Render terrain mesh
  return (
    <mesh 
      ref={ref}
      name="terrain-mesh"
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
      castShadow
      onClick={onClick}
    >
      <meshStandardMaterial 
        ref={materialRef}
        color="#45a74d" // Màu xanh lá cây cho mặt trên
        roughness={0.8}
        metalness={0.2}
        side={THREE.FrontSide}
      />
    </mesh>
  );
});

export default memo(Terrain);