import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';
import { easing } from 'maath';

// Định nghĩa kiểu cho kiểm tra controls
type ControlsType = {
  target?: Vector3;
  update?: () => void;
};

export interface CameraPosition {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  name: string;
  description?: string;
}

export const FARM_VIEWPOINTS: CameraPosition[] = [
  {
    id: 'overview',
    position: [20, 20, 20],
    target: [0, 0, 0],
    name: 'Tổng quan trang trại',
    description: 'Nhìn toàn cảnh khu vực trang trại'
  },
  {
    id: 'house',
    position: [-6, 3, 0],
    target: [-2.62, -1.97, -1.05],
    name: 'Ngôi nhà',
    description: 'Thăm quan ngôi nhà trang trại'
  },
  {
    id: 'coffee',
    position: [-10, 3, 12],
    target: [-6, -2, 7],
    name: 'Vườn cà phê',
    description: 'Khu vực trồng cây cà phê'
  },
  {
    id: 'cherry',
    position: [12, 3, -2],
    target: [9, -2, -3],
    name: 'Vườn anh đào',
    description: 'Khu vực trồng cây anh đào'
  },
  {
    id: 'forest',
    position: [0, 10, -25],
    target: [0, 0, -20],
    name: 'Khu rừng',
    description: 'Khu rừng tự nhiên phía xa'
  }
];

interface CameraControllerProps {
  initialViewId?: string;
  transitionDuration?: number;
}

const CameraController: React.FC<CameraControllerProps> = ({
  initialViewId = 'overview',
  transitionDuration = 2.0
}) => {
  const { camera, controls } = useThree();
  const [currentView, setCurrentView] = useState<string>(initialViewId);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Référence pour suivre la progression de la transition
  const transitionRef = useRef({
    startTime: 0,
    duration: transitionDuration,
    progress: 0,
    isActive: false,
    startPosition: new Vector3(),
    startRotation: new Quaternion(),
    targetPosition: new Vector3(),
    targetLookAt: new Vector3(),
  });

  // Écouter les événements pour changer la vue
  useEffect(() => {
    const handleViewChange = (e: CustomEvent) => {
      if (e.detail && e.detail.viewId) {
        goToView(e.detail.viewId);
      }
    };

    window.addEventListener('change-view', handleViewChange as EventListener);
    
    // Configurer la vue initiale
    const initialView = FARM_VIEWPOINTS.find(v => v.id === initialViewId);
    if (initialView) {
      // Définir directement la position initiale sans animation
      camera.position.set(...initialView.position);
      const targetVector = new Vector3(...initialView.target);
      camera.lookAt(targetVector);
      if (controls && 'target' in controls && 'update' in controls) {
        (controls as ControlsType).target?.copy(targetVector);
        (controls as ControlsType).update?.();
      }
    }
    
    return () => {
      window.removeEventListener('change-view', handleViewChange as EventListener);
    };
  }, [camera, controls, initialViewId]);

  // Animation fluide de la caméra
  useFrame((_, delta) => {
    if (transitionRef.current.isActive) {
      // Mettre à jour la progression
      transitionRef.current.progress = Math.min(
        (performance.now() - transitionRef.current.startTime) / (transitionRef.current.duration * 1000),
        1.0
      );
      
      const t = transitionRef.current.progress;
      
      // Fonction d'easing pour une animation fluide (accélération et décélération)
      const easedT = easeInOutCubic(t);
      
      // Interpoler la position de la caméra
      camera.position.lerpVectors(
        transitionRef.current.startPosition,
        transitionRef.current.targetPosition,
        easedT
      );
      
      // Interpoler la rotation de la caméra pour regarder vers la cible
      const tempLookAt = new Vector3().lerpVectors(
        transitionRef.current.startRotation.clone().set(0,0,0,1),
        transitionRef.current.targetLookAt,
        easedT
      );
      
      camera.lookAt(tempLookAt);
      
      // Mettre à jour les contrôles si disponibles
      if (controls && 'target' in controls && 'update' in controls) {
        // Sử dụng thuộc tính target và update an toàn
        (controls as ControlsType).target?.copy(tempLookAt);
        (controls as ControlsType).update?.();
      }
      
      // Vérifier si la transition est terminée
      if (t >= 1.0) {
        transitionRef.current.isActive = false;
        setIsTransitioning(false);
      }
    } else if (controls && 'update' in controls) {
      // Amortissement normal des contrôles pendant l'utilisation manuelle
      easing.damp3(camera.position, camera.position, 0.25, delta);
      (controls as ControlsType).update?.();
    }
  });

  // Fonction pour déclencher une transition vers une nouvelle vue
  const goToView = (viewId: string) => {
    const view = FARM_VIEWPOINTS.find(v => v.id === viewId);
    
    if (view && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentView(viewId);
      
      // Configurer la transition
      transitionRef.current.isActive = true;
      transitionRef.current.startTime = performance.now();
      transitionRef.current.progress = 0;
      
      // Sauvegarder la position et rotation actuelles
      transitionRef.current.startPosition.copy(camera.position);
      transitionRef.current.startRotation.copy(camera.quaternion);
      
      // Définir les cibles
      transitionRef.current.targetPosition.set(...view.position);
      transitionRef.current.targetLookAt.set(...view.target);
      
      // Émettre un événement pour informer d'autres composants
      window.dispatchEvent(new CustomEvent('view-changing', { 
        detail: { 
          fromViewId: currentView,
          toViewId: viewId,
          view: view
        } 
      }));
    }
  };

  // Fonction d'easing cubique pour des transitions fluides
  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // Exposer l'API pour d'autres composants
  useEffect(() => {
    // Rendre disponible la méthode goToView pour d'autres composants
    window.farmCameraController = {
      goToView,
      getCurrentView: () => currentView,
      isTransitioning: () => isTransitioning,
      getViewpoints: () => FARM_VIEWPOINTS
    };
    
    return () => {
      window.farmCameraController = undefined;
    };
  }, [currentView, isTransitioning]);

  return null; // Ce composant ne rend rien visuellement
};

// Ajouter l'interface à l'objet window
declare global {
  interface Window {
    farmCameraController?: {
      goToView: (viewId: string) => void;
      getCurrentView: () => string;
      isTransitioning: () => boolean;
      getViewpoints: () => CameraPosition[];
    };
  }
}

export default CameraController;
