import * as THREE from 'three';

// Define tree types
export type TreeType = 'pine' | 'oak' | 'birch';

// Configuration for tree spawning
export interface TreeSpawnerConfig {
  // Number of trees to spawn
  count: number;
  
  // Area boundaries for spawning (relative to terrain size)
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  
  // Distribution of tree types (should sum to 1.0)
  treeTypeDistribution: {
    pine: number;  // e.g. 0.6 means 60% pine trees
    oak: number;   // e.g. 0.3 means 30% oak trees
    birch: number; // e.g. 0.1 means 10% birch trees
  };
  
  // Minimum distance between trees
  minDistance: number;
  
  // Minimum distance from other objects (house, fruit trees, etc.)
  minDistanceFromObjects: number;
  
  // Maximum slope angle for tree placement (in degrees)
  maxSlopeAngle: number;
  
  // Minimum distance from cliff edges
  cliffEdgeDistance: number;
  
  // Exclude spawning in certain areas (optional)
  exclusionZones?: Array<{
    center: [number, number]; // X, Z center position
    radius: number;          // Radius of exclusion zone
  }>;

  // Positions of other objects (house, fruit trees, etc.) to keep distance from
  objectPositions?: Array<{
    position: [number, number, number]; // x, y, z
    radius?: number; // Optional custom radius for this object
  }>;
}

// Default configuration
export const DEFAULT_TREE_CONFIG: TreeSpawnerConfig = {
  count: 50,
  minX: -22, // Slightly within the terrain boundaries
  maxX: 22,  // Slightly within the terrain boundaries
  minZ: -22, // Slightly within the terrain boundaries
  maxZ: 22,  // Slightly within the terrain boundaries
  treeTypeDistribution: {
    pine: 0.6,   // 60% pine trees
    oak: 0.3,    // 30% oak trees
    birch: 0.1,  // 10% birch trees
  },
  minDistance: 2.5, // Minimum distance between trees
  minDistanceFromObjects: 3.0, // Minimum distance from other objects
  maxSlopeAngle: 25, // Maximum slope angle in degrees
  cliffEdgeDistance: 2.0, // Minimum distance from cliff edges
  objectPositions: [],
};

// Define tree data structure
export interface TreeData {
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // x, y, z in radians
  scale: number;
  type: TreeType;
}

export class TreeSpawner {
  private config: TreeSpawnerConfig;
  private trees: TreeData[] = [];
  private terrainRef: React.RefObject<THREE.Mesh> | null = null;
  
  constructor(config: Partial<TreeSpawnerConfig> = {}) {
    // Merge default config with provided config
    this.config = { ...DEFAULT_TREE_CONFIG, ...config };
  }
  
  /**
   * Set the terrain reference to use for height sampling
   */
  public setTerrainRef(ref: React.RefObject<THREE.Mesh>) {
    this.terrainRef = ref;
    console.log("TreeSpawner: TerrainRef set:", ref.current ? "valid" : "null");
  }
  
  /**
   * Update the spawner configuration
   */
  public updateConfig(config: Partial<TreeSpawnerConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Set positions of other objects to keep distance from
   */
  public setObjectPositions(positions: Array<{ position: [number, number, number]; radius?: number }>) {
    this.config.objectPositions = positions;
  }
  
  /**
   * Generate random positions for trees
   */
  public generateTrees(): TreeData[] {
    this.trees = [];
    
    // Kiểm tra xem terrainRef đã được thiết lập hay chưa
    if (!this.terrainRef || !this.terrainRef.current) {
      console.warn("TreeSpawner: Cannot generate trees, terrain reference is not available");
      return this.trees;
    }
    
    // Attempt to place trees based on the count
    let attempts = 0;
    const maxAttempts = this.config.count * 10; // Allow 10x attempts to place all trees
    
    while (this.trees.length < this.config.count && attempts < maxAttempts) {
      attempts++;
      
      // Generate random position within boundaries
      const x = THREE.MathUtils.randFloat(this.config.minX, this.config.maxX);
      const z = THREE.MathUtils.randFloat(this.config.minZ, this.config.maxZ);
      
      // Check if position is within any exclusion zone
      if (this.isInExclusionZone(x, z)) continue;
      
      // Check distance from other trees
      if (this.isTooCloseToOtherTrees(x, z)) continue;
      
      // Check distance from other objects (house, fruit trees, etc.)
      if (this.isTooCloseToObjects(x, z)) continue;
      
      // Get terrain height at this position
      const y = this.getTerrainHeightAt(x, z);
      
      // If height couldn't be determined, skip this position
      if (y === null) continue;
      
      // Check if the position is on a steep slope
      if (this.isOnSteepSlope(x, z)) continue;
      
      // Check if the position is too close to a cliff edge
      if (this.isNearCliffEdge(x, z)) continue;
      
      // Determine tree type based on distribution
      const type = this.getRandomTreeType();
      
      // Calculate random rotation and scale
      const rotationY = Math.random() * Math.PI * 2;
      const scale = 0.5 + Math.random() * 0.3; // Random scale between 0.5 and 0.8
      
      // Create tree data
      const treeData: TreeData = {
        position: [x, y, z],
        rotation: [0, rotationY, 0],
        scale,
        type,
      };
      
      this.trees.push(treeData);
    }
    
    console.log(`TreeSpawner: Generated ${this.trees.length} trees after ${attempts} attempts`);
    return this.trees;
  }
  
  /**
   * Check if a position is within any exclusion zone
   */
  private isInExclusionZone(x: number, z: number): boolean {
    if (!this.config.exclusionZones) return false;
    
    return this.config.exclusionZones.some(zone => {
      const dx = x - zone.center[0];
      const dz = z - zone.center[1];
      const distanceSquared = dx * dx + dz * dz;
      return distanceSquared < zone.radius * zone.radius;
    });
  }
  
  /**
   * Check if a position is too close to existing trees
   */
  private isTooCloseToOtherTrees(x: number, z: number): boolean {
    return this.trees.some(tree => {
      const dx = x - tree.position[0];
      const dz = z - tree.position[2];
      const distanceSquared = dx * dx + dz * dz;
      return distanceSquared < this.config.minDistance * this.config.minDistance;
    });
  }
  
  /**
   * Check if a position is too close to other objects (house, fruit trees, etc.)
   */
  private isTooCloseToObjects(x: number, z: number): boolean {
    if (!this.config.objectPositions || this.config.objectPositions.length === 0) {
      return false;
    }
    
    return this.config.objectPositions.some(obj => {
      const dx = x - obj.position[0];
      const dz = z - obj.position[2];
      const distanceSquared = dx * dx + dz * dz;
      // Use object's custom radius if provided, otherwise use the default minDistanceFromObjects
      const minDist = obj.radius || this.config.minDistanceFromObjects;
      return distanceSquared < minDist * minDist;
    });
  }
  
  /**
   * Get terrain height at a specific world position
   * Uses raycasting to find the exact height
   */
  private getTerrainHeightAt(x: number, z: number): number | null {
    if (!this.terrainRef || !this.terrainRef.current) {
      console.warn("TreeSpawner: Terrain reference not available for height sampling");
      return 0; // Default fallback height
    }
    
    // Create a raycaster to find terrain height
    const raycaster = new THREE.Raycaster();
    
    // Đặt ray origin cao hơn nhiều so với điểm cao nhất có thể của terrain
    const rayOrigin = new THREE.Vector3(x, 100, z);
    const rayDirection = new THREE.Vector3(0, -1, 0);
    rayDirection.normalize();
    
    raycaster.set(rayOrigin, rayDirection);
    
    // Get terrain mesh - đã được đặt đúng trong scene
    const terrain = this.terrainRef.current;
    
    // Đảm bảo terrain được cập nhật matrix
    terrain.updateMatrixWorld(true);
    
    // Kiểm tra giao điểm với terrain - không check descendants để tăng hiệu suất
    const intersects = raycaster.intersectObject(terrain, false);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      // Trả về độ cao terrain tại điểm này
      // Thêm một offset nhỏ để đảm bảo cây không bị chìm trong đất
      return point.y;
    }
    
    console.warn(`TreeSpawner: No intersection found for position (${x}, ${z}), using fallback y=0`);
    return 0;
  }
  
  /**
   * Check if a position is on a steep slope
   * Uses multiple sample points to determine the slope angle
   */
  private isOnSteepSlope(x: number, z: number): boolean {
    if (!this.terrainRef || !this.terrainRef.current) {
      return false;
    }
    
    // Sample height at multiple points around the position
    const sampleDistance = 0.5; // Distance between sample points
    const center = this.getTerrainHeightAt(x, z);
    const north = this.getTerrainHeightAt(x, z + sampleDistance);
    const east = this.getTerrainHeightAt(x + sampleDistance, z);
    const south = this.getTerrainHeightAt(x, z - sampleDistance);
    const west = this.getTerrainHeightAt(x - sampleDistance, z);
    
    // Ensure all samples were successful
    if (center === null || north === null || east === null || south === null || west === null) {
      // If we can't determine slope, reject the position to be safe
      return true;
    }
    
    // Calculate height differences
    const dNorth = Math.abs(north - center);
    const dEast = Math.abs(east - center);
    const dSouth = Math.abs(south - center);
    const dWest = Math.abs(west - center);
    
    // Calculate maximum slope angle in any direction
    const maxDiff = Math.max(dNorth, dEast, dSouth, dWest);
    const slopeAngle = Math.atan(maxDiff / sampleDistance) * (180 / Math.PI);
    
    // Return true if slope angle exceeds maximum allowed
    return slopeAngle > this.config.maxSlopeAngle;
  }
  
  /**
   * Check if a position is too close to a cliff edge
   * Uses height differences to detect nearby cliffs
   */
  private isNearCliffEdge(x: number, z: number): boolean {
    if (!this.terrainRef || !this.terrainRef.current) {
      return false;
    }
    
    // Get center height
    const centerHeight = this.getTerrainHeightAt(x, z);
    if (centerHeight === null) {
      return true; // Reject if we can't determine height
    }
    
    // Sample points in a circle around the position
    const numSamples = 8;
    const cliffCheckDistance = this.config.cliffEdgeDistance;
    const cliffHeightThreshold = 1.0; // Height difference that constitutes a cliff
    
    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2;
      const sampleX = x + Math.cos(angle) * cliffCheckDistance;
      const sampleZ = z + Math.sin(angle) * cliffCheckDistance;
      
      const sampleHeight = this.getTerrainHeightAt(sampleX, sampleZ);
      
      // If height couldn't be determined or height difference is too large, consider it a cliff
      if (sampleHeight === null || Math.abs(sampleHeight - centerHeight) > cliffHeightThreshold) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get a random tree type based on the distribution in config
   */
  private getRandomTreeType(): TreeType {
    const rand = Math.random();
    const { pine, oak } = this.config.treeTypeDistribution;
    
    if (rand < pine) {
      return 'pine';
    } else if (rand < pine + oak) {
      return 'oak';
    } else {
      return 'birch';
    }
  }
}

// Export a singleton instance for easy use
export const treeSpawner = new TreeSpawner();