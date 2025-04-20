import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { createNoise2D } from 'simplex-noise';

// Các tham số địa hình
const GRID_SIZE = 50; // Kích thước lưới
const GRID_RESOLUTION = 100; // Số lượng phân đoạn
const HEIGHT_MULTIPLIER = 4.0; // Hệ số nhân chiều cao (tăng lên để địa hình cao hơn)
const NOISE_SCALE = 0.15; // Tỉ lệ noise (tăng lên cho địa hình nhấp nhô nhiều hơn)
const TERRAIN_THICKNESS = 0.55; // Độ dày của địa hình

// Tham số điều chỉnh địa hình
const NOISE_OCTAVES = 4; // Số lớp noise chồng lên nhau
const NOISE_PERSISTENCE = 0.6; // Độ bền của các octave (0-1)
const NOISE_LACUNARITY = 2.0; // Tần số giữa các octave
const FLATTEN_STRENGTH = 1.5; // Độ mạnh của hiệu ứng làm phẳng ở trung tâm (cao hơn = phẳng hơn)
const FLATTEN_RADIUS = 0.25; // Bán kính vùng phẳng ở trung tâm (0-1)
const HILLS_STRENGTH = [1.0, 0.6, 0.3, 0.15]; // Cường độ của mỗi lớp đồi (octave)

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
  
  // Hàm lấy độ cao từ heightmap texture
  const getHeightFromTexture = (texture: THREE.Texture, u: number, v: number): number => {
    // Tạo canvas để đọc dữ liệu từ texture
    if (!texture.image) return 0;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    context.drawImage(texture.image, 0, 0);
    
    // Lấy điểm ảnh tại vị trí (u,v) trong texture
    const pixelX = Math.floor(u * (canvas.width - 1));
    const pixelY = Math.floor(v * (canvas.height - 1));
    
    // Đọc giá trị grayscale (sử dụng màu đỏ làm dữ liệu độ cao)
    const data = context.getImageData(pixelX, pixelY, 1, 1).data;
    // Lấy giá trị từ 0-255 và chuẩn hóa về khoảng -1 đến 1
    return (data[0] / 255) * 2 - 1;
  };
  
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
      
      setHeightmapData(heightData);
    }
  }, [heightmapTexture]);
  
  // Hàm nội suy để lấy độ cao từ heightmap data
  const getHeightFromHeightmap = (u: number, v: number): number => {
    if (heightmapData.length === 0) return 0;
    
    const width = heightmapData[0].length;
    const height = heightmapData.length;
    
    // Chuyển đổi u, v (0-1) sang tọa độ mảng
    const x = Math.min(Math.floor(u * (width - 1)), width - 1);
    const y = Math.min(Math.floor(v * (height - 1)), height - 1);
    
    return heightmapData[y][x];
  };
  
  // Hàm tạo giá trị noise với nhiều octave
  const getNoiseValue = (x: number, y: number) => {
    let amplitude = 1.0;
    let frequency = 1.0;
    let noiseValue = 0;
    let amplitudeSum = 0;
    
    // Tạo nhiều lớp noise chồng lên với tần số và biên độ khác nhau
    for (let i = 0; i < NOISE_OCTAVES; i++) {
      const noiseX = x * frequency * NOISE_SCALE;
      const noiseY = y * frequency * NOISE_SCALE;
      
      // Thêm layer noise với cường độ giảm dần
      noiseValue += HILLS_STRENGTH[i] * amplitude * noise2D(noiseX, noiseY);
      
      amplitudeSum += amplitude;
      amplitude *= NOISE_PERSISTENCE;
      frequency *= NOISE_LACUNARITY;
    }
    
    // Chuẩn hóa về khoảng -1 đến 1
    return noiseValue / amplitudeSum;
  };
  
  // Tạo geometry cho địa hình
  const geometry = useMemo(() => {
    // Bước 1: Tạo heightmap bằng PlaneGeometry
    const planeGeometry = new THREE.PlaneGeometry(
      GRID_SIZE, 
      GRID_SIZE,
      GRID_RESOLUTION,
      GRID_RESOLUTION
    );
    
    // Tạo heightmap sử dụng heightmap image hoặc noise
    const { position } = planeGeometry.attributes;
    const vertex = new THREE.Vector3();
    
    // Áp dụng heightmap hoặc noise và tạo một heightmap thực tế
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
      
      // Tạo khu vực bằng phẳng ở giữa (cho khu vực trồng trọt)
      const distanceFromCenter = Math.sqrt(x * x + y * y) / FLATTEN_RADIUS;
      
      // Sử dụng hàm mượt để tạo chuyển tiếp mềm mại
      const flattenFactor = 1.0 - Math.min(1, Math.max(0, 
        1.0 - Math.pow(Math.max(0, distanceFromCenter - 0.5), FLATTEN_STRENGTH)
      ));
      
      // Làm phẳng khu vực trung tâm
      vertex.z *= flattenFactor;
      
      // Thêm một số gợn nhẹ cho khu vực trung tâm để không quá phẳng
      if (distanceFromCenter < 0.4) {
        vertex.z += 0.1 * noise2D(x * 10, y * 10) * (0.4 - distanceFromCenter);
      }
      
      // Cập nhật vị trí
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // Tính toán normal mới do địa hình đã thay đổi
    planeGeometry.computeVertexNormals();
    
    // Bước 2: Tạo địa hình 3D có độ dày bằng cách tạo một BufferGeometry mới
    const terrainGeometry = new THREE.BufferGeometry();
    
    // Sao chép thuộc tính position từ planeGeometry
    const positions = Array.from(planeGeometry.attributes.position.array);
    const normals = Array.from(planeGeometry.attributes.normal.array);
    const indices = Array.from(planeGeometry.index ? planeGeometry.index.array : []);
    
    // Số lượng đỉnh trong planeGeometry
    const vertexCount = positions.length / 3;
    
    // Mảng mới cho geometry có độ dày
    const newPositions = [];
    const newNormals = [];
    const newIndices = [];
    const newUvs = [];
    
    // Tạo các đỉnh cho mặt trên (sao chép từ planeGeometry)
    for (let i = 0; i < vertexCount; i++) {
      newPositions.push(
        positions[i * 3],     // x
        positions[i * 3 + 1], // y
        positions[i * 3 + 2]  // z
      );
      
      newNormals.push(
        normals[i * 3],     // nx
        normals[i * 3 + 1], // ny
        normals[i * 3 + 2]  // nz
      );
      
      // UV coordinates
      const u = (positions[i * 3] / GRID_SIZE + 0.5);
      const v = (positions[i * 3 + 1] / GRID_SIZE + 0.5);
      newUvs.push(u, v);
    }
    
    // Tạo các đỉnh cho mặt dưới (offset theo trục Z)
    for (let i = 0; i < vertexCount; i++) {
      newPositions.push(
        positions[i * 3],     // x
        positions[i * 3 + 1], // y
        positions[i * 3 + 2] - TERRAIN_THICKNESS  // z - thickness
      );
      
      newNormals.push(
        -normals[i * 3],     // -nx (đảo chiều normal)
        -normals[i * 3 + 1], // -ny
        -normals[i * 3 + 2]  // -nz
      );
      
      // UV coordinates (giống mặt trên)
      const u = (positions[i * 3] / GRID_SIZE + 0.5);
      const v = (positions[i * 3 + 1] / GRID_SIZE + 0.5);
      newUvs.push(u, v);
    }
    
    // Thêm indices cho mặt trên (sao chép từ planeGeometry)
    for (let i = 0; i < indices.length; i++) {
      newIndices.push(indices[i]);
    }
    
    // Thêm indices cho mặt dưới (đảo chiều để đúng winding order)
    for (let i = 0; i < indices.length; i += 3) {
      // Thêm tam giác với chiều ngược lại
      newIndices.push(
        indices[i] + vertexCount,
        indices[i + 2] + vertexCount,
        indices[i + 1] + vertexCount
      );
    }
    
    // Thêm indices cho các mặt bên (kết nối mặt trên và mặt dưới)
    // Tìm các cạnh ở viền ngoài của grid
    const edgeVertices = new Set();
    const edgePairs = [];
    
    // Duyệt qua các tam giác để tìm các cạnh ở viền
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];
      
      // Kiểm tra từng cạnh xem có phải là cạnh viền không
      checkAndAddEdge(a, b);
      checkAndAddEdge(b, c);
      checkAndAddEdge(c, a);
    }
    
    function checkAndAddEdge(a, b) {
      // Chuẩn hóa thứ tự để tránh trùng lặp
      const edge = a < b ? a + "," + b : b + "," + a;
      
      // Nếu đã gặp cạnh này trước đó, nó không phải là cạnh viền
      if (edgeVertices.has(edge)) {
        edgeVertices.delete(edge);
      } else {
        // Đây là lần đầu gặp cạnh này
        edgeVertices.add(edge);
        edgePairs.push([a, b]);
      }
    }
    
    // Tạo các mặt bên bằng cách kết nối các cạnh viền của mặt trên và mặt dưới
    for (const [a, b] of edgePairs) {
      // Mặt bên 1
      newIndices.push(a, b, a + vertexCount);
      
      // Mặt bên 2
      newIndices.push(b, b + vertexCount, a + vertexCount);
    }
    
    // Tạo BufferGeometry mới với các thuộc tính đã tạo
    terrainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    terrainGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
    terrainGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
    terrainGeometry.setIndex(newIndices);
    
    // Tính toán normals
    terrainGeometry.computeVertexNormals();
    
    return terrainGeometry;
  }, [noise2D, useHeightmap, heightmapData]);
  
  // Animation và update terrain
  const materialRef = useRef(null);
  
  // Render terrain mesh
  return (
    <mesh 
      ref={ref}
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
      castShadow
      onClick={onClick}
    >
      <meshStandardMaterial 
        ref={materialRef}
        color="#3a7c40" // Màu xanh lá cây cho mặt trên
        roughness={0.8}
        metalness={0.2}
        side={THREE.DoubleSide} // Hiển thị cả hai mặt
      />
    </mesh>
  );
});

export default Terrain;