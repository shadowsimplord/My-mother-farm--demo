import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';

interface TransitionManagerProps {
  children?: React.ReactNode;
  cameraPositions: {
    [key: string]: {
      position: [number, number, number];
      target?: [number, number, number];
    };
  };
  initialView: string;
}

/**
 * TransitionManager - Quản lý chuyển đổi mượt mà giữa các góc nhìn khác nhau trong scene
 * Tích hợp với OrbitControls để tránh xung đột
 */
const TransitionManager: React.FC<TransitionManagerProps> = ({ 
  children, 
  cameraPositions, 
  initialView = 'overview' 
}) => {
  const { camera } = useThree();
  const [currentView, setCurrentView] = useState<string>(initialView);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const controlsRef = useRef<any>(null);
  const isDisruptedRef = useRef<boolean>(false);

  // Tìm OrbitControls
  useFrame(state => {
    // Lấy controls từ state nếu chưa có
    if (!controlsRef.current) {
      const controls = state.controls;
      if (controls) {
        controlsRef.current = controls;
      }
    }
  });

  // Camera spring animation với config mượt mà hơn
  const { cameraPos, lookAtPos } = useSpring({
    from: {
      cameraPos: cameraPositions[initialView]?.position || [15, 15, 15],
      lookAtPos: cameraPositions[initialView]?.target || [0, 0, 0]
    },
    to: {
      cameraPos: cameraPositions[currentView]?.position || [15, 15, 15],
      lookAtPos: cameraPositions[currentView]?.target || [0, 0, 0]
    },
    config: {
      mass: 1.5,
      tension: 80,  // Giảm tension để chuyển động mượt hơn
      friction: 26, // Tăng ma sát để hạn chế dao động
      clamp: false, // Không clamp để có độ mượt khi dừng
      precision: 0.0001
    },
    onChange: () => {
      setIsTransitioning(true);
    },
    onRest: () => {
      setIsTransitioning(false);
      isDisruptedRef.current = false; // Reset sau khi transition hoàn thành
    }
  });

  // Update camera position và target, tích hợp với controls
  useFrame(() => {
    // Chỉ cập nhật khi đang transition hoặc đã bị disrupted
    if (isTransitioning || isDisruptedRef.current) {
      // Update camera position mượt mà
      const [x, y, z] = cameraPos.get();
      camera.position.set(x, y, z);
      
      // Update lookAt target và controls target
      const [tx, ty, tz] = lookAtPos.get();
      targetRef.current.set(tx, ty, tz);
      
      // Cập nhật controls target nếu có
      if (controlsRef.current && 'target' in controlsRef.current) {
        controlsRef.current.target.copy(targetRef.current);
      }
    }
  });

  // Khởi tạo API và expose qua window
  useEffect(() => {
    // Đảm bảo rằng chuyển cảnh sẽ không làm gián đoạn tương tác với cây
    window.transitionManager = {
      transitionTo: (viewId: string) => {
        if (cameraPositions[viewId]) {
          // Đánh dấu rằng chúng ta đang chuyển cảnh một cách chủ động
          isDisruptedRef.current = true;
          setCurrentView(viewId);
        } else {
          console.warn(`View "${viewId}" not found in camera positions`);
        }
      },
      getCurrentView: () => currentView,
      isTransitioning: () => isTransitioning
    };
    
    return () => {
      window.transitionManager = undefined;
    };
  }, [cameraPositions, currentView, isTransitioning]);

  // Bảo toàn điều khiển người dùng nếu không đang transition
  useEffect(() => {
    // Lưu góc nhìn ban đầu
    if (cameraPositions[initialView]) {
      const pos = cameraPositions[initialView].position;
      const target = cameraPositions[initialView].target || [0, 0, 0];
      
      camera.position.set(pos[0], pos[1], pos[2]);
      camera.lookAt(new THREE.Vector3(target[0], target[1], target[2]));
    }
  }, [camera, cameraPositions, initialView]);

  return <>{children}</>;
};

// Định nghĩa global interface cho window.transitionManager
declare global {
  interface Window {
    transitionManager?: {
      transitionTo: (viewId: string) => void;
      getCurrentView: () => string;
      isTransitioning: () => boolean;
    };
  }
}

export default TransitionManager;