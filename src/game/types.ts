// Define common types used across the application

// Tree types
export type TreeType = 'pine' | 'oak' | 'birch';

// Coffee tree types
export type CoffeeTreeType = 'caphe_vietnam' | 'caphe_arabica' | 'caphe_robusta';

// Tree data structure
export interface TreeData {
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // x, y, z in radians
  scale: number;
  type: TreeType;
}

// Fruit tree data structure
export interface FruitTreeData {
  id: string;
  type: string;
  daysPlanted: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  status?: string;
}

// Tree info for event handlers
export interface TreeInfo {
  id?: string;
  position: [number, number, number];
  daysPlanted?: number;
  type?: string;
  status?: string;
}
