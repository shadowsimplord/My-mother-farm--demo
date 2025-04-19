import * as THREE from 'three';

// Định nghĩa loại đất
export enum SoilType {
  REGULAR,  // Đất thường
  WET,      // Đất ẩm ướt
  FERTILE,  // Đất màu mỡ
  ROCKY     // Đất đá
}

// Định nghĩa trạng thái đất
export enum SoilState {
  UNPLOWED,  // Chưa cày xới
  PLOWED,    // Đã cày xới
  SEEDED,    // Đã gieo hạt
  GROWING,   // Đang phát triển
  READY      // Sẵn sàng thu hoạch
}

// Định nghĩa cấu trúc ô đất
export interface FarmTile {
  position: THREE.Vector2;   // Vị trí trong grid
  worldPosition: THREE.Vector3; // Vị trí trong không gian 3D
  type: SoilType;            // Loại đất
  state: SoilState;          // Trạng thái
  moisture: number;          // Độ ẩm (0-1)
  fertility: number;         // Độ màu mỡ (0-1)
  plantType?: string;        // Loại cây trồng (nếu có)
  plantStage?: number;       // Giai đoạn phát triển của cây (0-1)
  plantedTime?: number;      // Thời gian cây được trồng
}

export class GridSystem {
  // Kích thước grid
  private gridSize: number;
  // Kích thước mỗi ô
  private tileSize: number;
  // Mảng các ô đất
  private tiles: FarmTile[][];
  
  constructor(gridSize: number = 10, tileSize: number = 1) {
    this.gridSize = gridSize;
    this.tileSize = tileSize;
    this.tiles = [];
    
    // Khởi tạo grid
    this.initializeGrid();
  }
  
  // Khởi tạo grid với các ô đất
  private initializeGrid(): void {
    const halfGrid = this.gridSize / 2;
    
    for (let x = 0; x < this.gridSize; x++) {
      this.tiles[x] = [];
      
      for (let z = 0; z < this.gridSize; z++) {
        // Tính toán vị trí thế giới cho ô đất
        const worldX = (x - halfGrid) * this.tileSize;
        const worldZ = (z - halfGrid) * this.tileSize;
        
        // Khởi tạo ngẫu nhiên loại đất
        const soilType = this.randomSoilType();
        
        // Tạo ô đất mới
        this.tiles[x][z] = {
          position: new THREE.Vector2(x, z),
          worldPosition: new THREE.Vector3(worldX, 0, worldZ),
          type: soilType,
          state: SoilState.UNPLOWED,
          moisture: Math.random() * 0.3,  // Khởi tạo với độ ẩm ngẫu nhiên thấp
          fertility: this.getFertilityBasedOnType(soilType)
        };
      }
    }
  }
  
  // Lấy độ màu mỡ dựa trên loại đất
  private getFertilityBasedOnType(type: SoilType): number {
    switch(type) {
      case SoilType.FERTILE:
        return 0.8 + Math.random() * 0.2; // 0.8-1.0
      case SoilType.WET:
        return 0.6 + Math.random() * 0.2; // 0.6-0.8
      case SoilType.REGULAR:
        return 0.4 + Math.random() * 0.2; // 0.4-0.6
      case SoilType.ROCKY:
        return 0.1 + Math.random() * 0.2; // 0.1-0.3
      default:
        return 0.5;
    }
  }
  
  // Hàm helper để tạo ngẫu nhiên loại đất với tỷ lệ hợp lý
  private randomSoilType(): SoilType {
    const rand = Math.random();
    
    if (rand < 0.1) {
      return SoilType.FERTILE;  // 10% cơ hội
    } else if (rand < 0.3) {
      return SoilType.WET;      // 20% cơ hội
    } else if (rand < 0.8) {
      return SoilType.REGULAR;  // 50% cơ hội
    } else {
      return SoilType.ROCKY;    // 20% cơ hội
    }
  }
  
  // Lấy ô đất tại vị trí (x, z)
  public getTile(x: number, z: number): FarmTile | null {
    if (x >= 0 && x < this.gridSize && z >= 0 && z < this.gridSize) {
      return this.tiles[x][z];
    }
    return null;
  }
  
  // Cập nhật trạng thái ô đất
  public updateTileState(x: number, z: number, state: SoilState): boolean {
    const tile = this.getTile(x, z);
    if (tile) {
      tile.state = state;
      return true;
    }
    return false;
  }
  
  // Trồng cây trên ô đất
  public plantCrop(x: number, z: number, plantType: string): boolean {
    const tile = this.getTile(x, z);
    if (tile && tile.state === SoilState.PLOWED) {
      tile.plantType = plantType;
      tile.plantStage = 0;
      tile.plantedTime = Date.now();
      tile.state = SoilState.SEEDED;
      return true;
    }
    return false;
  }
  
  // Cập nhật sự phát triển của cây trồng
  public updateCrops(gameTime: number, growthRate: number = 1): void {
    for (let x = 0; x < this.gridSize; x++) {
      for (let z = 0; z < this.gridSize; z++) {
        const tile = this.tiles[x][z];
        
        // Nếu ô đất có cây và đang phát triển
        if (tile.plantType && (tile.state === SoilState.SEEDED || tile.state === SoilState.GROWING) && tile.plantedTime) {
          // Tính toán thời gian đã trồng
          const growthTime = (gameTime - tile.plantedTime) / 1000; // Đổi sang giây
          
          // Cập nhật giai đoạn phát triển (giả sử cây phát triển đầy đủ sau 60 giây)
          const fullGrowthTime = 60; // giây
          tile.plantStage = Math.min(growthTime / fullGrowthTime, 1) * growthRate * tile.fertility;
          
          // Cập nhật trạng thái
          if (tile.plantStage >= 1) {
            tile.state = SoilState.READY; // Sẵn sàng thu hoạch
          } else {
            tile.state = SoilState.GROWING;
          }
          
          // Giảm độ ẩm theo thời gian
          tile.moisture = Math.max(0, tile.moisture - 0.0001 * growthTime);
        }
      }
    }
  }
  
  // Lấy toàn bộ grid
  public getGrid(): FarmTile[][] {
    return this.tiles;
  }
  
  // Lấy kích thước grid
  public getGridSize(): number {
    return this.gridSize;
  }
  
  // Lấy kích thước ô
  public getTileSize(): number {
    return this.tileSize;
  }
}

export default GridSystem;