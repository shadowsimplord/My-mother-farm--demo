import { useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

/**
 * Hook để tải models GLTF và quản lý trạng thái loading
 * @param path Đường dẫn đến file model
 * @param onLoaded Callback được gọi khi model đã tải xong
 * @returns Đối tượng chứa model đã tải, trạng thái loading và lỗi (nếu có)
 */
export function useModelLoader(
  path: string,
  onLoaded?: (model: THREE.Group) => void
) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  // Định nghĩa kiểu dữ liệu cho gltf
  let gltf: GLTF | undefined;
  
  try {
    gltf = useLoader(
      GLTFLoader,
      path,
      (loader) => {
        const manager = loader.manager;
        manager.onProgress = (_url: string, itemsLoaded: number, itemsTotal: number) => {
          setProgress((itemsLoaded / itemsTotal) * 100);
        };
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error('Unknown error loading model'));
    }
  }
  
  useEffect(() => {
    if (gltf) {
      setIsLoading(false);
      if (onLoaded) {
        onLoaded(gltf.scene.clone());
      }
    }
  }, [gltf, onLoaded]);

  return {
    model: gltf?.scene.clone(),
    isLoading,
    error,
    progress
  };
}

/**
 * Hook tải nhiều models GLTF cùng một lúc
 * @param paths Mảng các đường dẫn đến các file model
 * @returns Đối tượng chứa mảng các models đã tải, trạng thái loading và lỗi
 */
export function useMultipleModelLoader(paths: string[]) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [models, setModels] = useState<THREE.Group[]>([]);
  
  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    const loadedModels: THREE.Group[] = [];
    
    manager.onProgress = (_url: string, itemsLoaded: number, itemsTotal: number) => {
      setProgress((itemsLoaded / itemsTotal) * 100);
    };
    
    manager.onLoad = () => {
      setIsLoading(false);
      setModels(loadedModels);
    };
    
    manager.onError = (url: string) => {
      setError(new Error(`Failed to load ${url}`));
    };
    
    paths.forEach((path, index) => {
      loader.load(
        path,
        (gltf: GLTF) => {
          loadedModels[index] = gltf.scene.clone();
        },
        undefined,
        (err: unknown) => {
          let errorMessage = 'Unknown error';
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          setError(new Error(`Failed to load ${path}: ${errorMessage}`));
        }
      );
    });
  }, [paths]);
  
  return {
    models,
    isLoading,
    error,
    progress
  };
}

export default useModelLoader;