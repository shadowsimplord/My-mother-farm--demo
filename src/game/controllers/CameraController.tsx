import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';

// Định nghĩa kiểu cho kiểm tra controls
type ControlsType = {
  target?: Vector3;
  update?: () => void;
  enabled?: boolean;
};

export interface CameraPosition {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  name: string;
  description?: string;
}

// Di chuyển các viewpoints vào file riêng để tránh lỗi Fast Refresh
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

// Khởi tạo sớm global API để tránh lỗi undefined
if (typeof window !== 'undefined') {
  window.farmCameraController = {
    // Triển khai mặc định - sẽ được ghi đè sau
    goToView: (viewId: string) => {
      console.log(`[CameraController] Requested to go to view: ${viewId}, but controller not initialized yet`);
      // Lưu lại yêu cầu để xử lý sau khi controller được khởi tạo
      window._pendingViewId = viewId;
    },
    getCurrentView: () => 'overview',
    isTransitioning: () => false,
    getViewpoints: () => FARM_VIEWPOINTS,
    resetControls: () => {}
  };
}

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
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const lastUpdateRef = useRef<number>(0); // Throttle update
  
  // Reference để theo dõi tiến trình của transition
  const transitionRef = useRef({
    startTime: 0,
    duration: transitionDuration * 1000, // Convert seconds to milliseconds
    progress: 0,
    isActive: false,
    startPosition: new Vector3(),
    startRotation: new Quaternion(),
    targetPosition: new Vector3(),
    targetLookAt: new Vector3(),
  });

  // Hàm gọi để kích hoạt chuyển đổi đến góc nhìn mới
  const goToView = (viewId: string) => {
    console.log(`[CameraController] Going to view: ${viewId}`);
    const view = FARM_VIEWPOINTS.find(v => v.id === viewId);
    
    if (view && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentView(viewId);
      
      // Thiết lập transition
      transitionRef.current.isActive = true;
      transitionRef.current.startTime = performance.now();
      transitionRef.current.progress = 0;
      
      // Lưu vị trí và góc quay hiện tại
      transitionRef.current.startPosition.copy(camera.position);
      
      // Định nghĩa mục tiêu
      transitionRef.current.targetPosition.set(...view.position);
      transitionRef.current.targetLookAt.set(...view.target);
      
      // Phát sự kiện để thông báo cho các component khác
      window.dispatchEvent(new CustomEvent('view-changing', { 
        detail: { 
          fromViewId: currentView,
          toViewId: viewId,
          view: view
        } 
      }));

      // Khóa camera vào vị trí cố định khi đến điểm xem khác ngoài overview
      if (viewId !== 'overview') {
        setIsLocked(true);
        // Vô hiệu hóa controls khi đang chuyển đổi
        if (controls && 'enabled' in controls) {
          (controls as ControlsType).enabled = false;
        }
      }
    }
  };

  // Hàm để reset về góc nhìn tự do
  const resetControls = () => {
    if (isLocked) {
      setIsLocked(false);
      if (controls && 'enabled' in controls) {
        (controls as ControlsType).enabled = true;
      }
    }
  };

  // Lắng nghe các sự kiện để thay đổi góc nhìn
  useEffect(() => {
    const handleViewChange = (e: CustomEvent) => {
      if (e.detail && e.detail.viewId) {
        goToView(e.detail.viewId);
      }
    };

    const handleResetControls = () => {
      resetControls();
    };

    window.addEventListener('change-view', handleViewChange as EventListener);
    window.addEventListener('reset-camera-controls', handleResetControls as EventListener);
    
    // Thiết lập góc nhìn ban đầu
    const initialViewData = FARM_VIEWPOINTS.find(v => v.id === initialViewId);
    if (initialViewData) {
      // Đặt trực tiếp vị trí ban đầu không cần animation
      camera.position.set(...initialViewData.position);
      const targetVector = new Vector3(...initialViewData.target);
      camera.lookAt(targetVector);
      if (controls && 'target' in controls && 'update' in controls) {
        (controls as ControlsType).target?.copy(targetVector);
        (controls as ControlsType).update?.();
      }
    }

    // Xử lý pending view request nếu có
    if (window._pendingViewId) {
      const pendingViewId = window._pendingViewId;
      setTimeout(() => {
        goToView(pendingViewId);
      }, 100);
      window._pendingViewId = undefined;
    }
    
    return () => {
      window.removeEventListener('change-view', handleViewChange as EventListener);
      window.removeEventListener('reset-camera-controls', handleResetControls as EventListener);
    };
  }, [camera, controls, initialViewId]);

  // Animation mượt mà cho camera
  useFrame(() => {
    if (transitionRef.current.isActive) {
      // Throttle: chỉ update tối đa 40 lần/giây
      const now = performance.now();
      if (now - lastUpdateRef.current < 25) return;
      lastUpdateRef.current = now;

      // Cập nhật tiến trình
      transitionRef.current.progress = Math.min(
        (now - transitionRef.current.startTime) / transitionRef.current.duration,
        1.0
      );
      
      const t = transitionRef.current.progress;
      
      // Hàm easing cho animation mượt mà (tăng/giảm tốc)
      const easedT = easeInOutCubic(t);
      
      // Nội suy vị trí camera
      camera.position.lerpVectors(
        transitionRef.current.startPosition,
        transitionRef.current.targetPosition,
        easedT
      );
      
      // Cải thiện nội suy hướng nhìn camera
      let startLookAt: Vector3;
      const target = (controls && 'target' in controls) ? (controls as ControlsType).target : undefined;
      if (target) {
        startLookAt = target.clone();
      } else {
        startLookAt = new Vector3().addVectors(
          transitionRef.current.startPosition,
          camera.getWorldDirection(new Vector3()).multiplyScalar(10)
        );
      }
      
      // Nội suy mượt giữa điểm nhìn hiện tại và điểm đích
      const tempLookAt = new Vector3().lerpVectors(
        startLookAt,
        transitionRef.current.targetLookAt,
        easedT
      );
      
      // Cập nhật hướng nhìn của camera
      camera.lookAt(tempLookAt);
      
      // Đồng bộ controls với camera
      if (controls && 'target' in controls && 'update' in controls) {
        (controls as ControlsType).target?.copy(tempLookAt);
        (controls as ControlsType).update?.();
      }
      
      // Kết thúc transition chỉ setState 1 lần
      if (t >= 1.0 && isTransitioning) {
        transitionRef.current.isActive = false;
        setIsTransitioning(false);
        
        // Đảm bảo camera đã ở đúng vị trí cuối cùng
        camera.position.copy(transitionRef.current.targetPosition);
        camera.lookAt(transitionRef.current.targetLookAt);
        
        // Cập nhật controls một lần nữa tại vị trí cuối cùng
        if (controls && 'target' in controls && 'update' in controls) {
          (controls as ControlsType).target?.copy(transitionRef.current.targetLookAt);
          (controls as ControlsType).update?.();
        }

        // Nếu không phải góc nhìn tổng quan, giữ camera ở vị trí cố định
        if (currentView !== 'overview') {
          if (controls && 'enabled' in controls) {
            // Cho phép controls nhưng với tính năng hạn chế
            (controls as ControlsType).enabled = true;
          }
        } else {
          // Khôi phục controls hoàn toàn cho góc nhìn tổng quan
          setIsLocked(false);
          if (controls && 'enabled' in controls) {
            (controls as ControlsType).enabled = true;
          }
        }
        
        // Gửi sự kiện khi transition hoàn tất
        window.dispatchEvent(new CustomEvent('view-changed', { 
          detail: { 
            viewId: currentView
          }
        }));
      }
    }
  });

  // Duy trì camera ở vị trí đã chọn khi locked
  useFrame(() => {
    // Nếu cần theo dõi target không khóa camera rotation
    if (isLocked && !isTransitioning && currentView !== 'overview') {
      const view = FARM_VIEWPOINTS.find(v => v.id === currentView);
      if (view) {
        // Chỉ theo dõi target để luôn hiển thị vùng quan tâm
        // mà không khóa khả năng xoay camera bằng chuột
        if (controls && 'target' in controls) {
          // Đã loại bỏ khai báo biến targetVector không dùng đến
          // Để người dùng có thể tự do di chuyển camera
        }
      }
    }
  });

  // Hàm easing cubic cho transitions mượt mà
  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // Expose API cho các component khác
  useEffect(() => {
    // Định nghĩa lại API
    window.farmCameraController = {
      goToView,
      getCurrentView: () => currentView,
      isTransitioning: () => isTransitioning,
      getViewpoints: () => FARM_VIEWPOINTS,
      resetControls: resetControls
    };
    
    return () => {
      // Không xóa hoàn toàn farmCameraController khi unmount 
      // để tránh lỗi khi FarmNavigation truy cập
      if (window.farmCameraController) {
        window.farmCameraController.goToView = (viewId: string) => {
          console.log(`[CameraController] Controller unmounted, cannot transition to ${viewId}`);
        };
      }
    };
  }, [currentView, isTransitioning]);

  return null; // Component này không render gì
};

// Thêm interface cho window
declare global {
  interface Window {
    farmCameraController?: {
      goToView: (viewId: string) => void;
      getCurrentView: () => string;
      isTransitioning: () => boolean;
      getViewpoints: () => CameraPosition[];
      resetControls: () => void;
    };
    _pendingViewId?: string; // Thêm cho xử lý pending view
  }
}

export default CameraController;
