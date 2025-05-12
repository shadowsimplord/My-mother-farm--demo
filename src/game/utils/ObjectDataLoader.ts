import objectData from '../systems/data/objectdata.json';

export interface BuildingData {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface ObjectData {
  buildings: {
    houses: BuildingData[];
  };
}

class ObjectDataLoader {
  private static instance: ObjectDataLoader;
  private data: ObjectData;

  private constructor() {
    this.data = objectData as ObjectData;
  }

  public static getInstance(): ObjectDataLoader {
    if (!ObjectDataLoader.instance) {
      ObjectDataLoader.instance = new ObjectDataLoader();
    }
    return ObjectDataLoader.instance;
  }

  public getHouses(): BuildingData[] {
    return this.data.buildings.houses;
  }
}

export default ObjectDataLoader;