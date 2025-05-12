import React, { useState, useCallback } from 'react';
import { Html } from '@react-three/drei';
import { FarmUIInterface } from '../../../components/ui/FarmUI';
import { CameraPosition } from '../../../components/controls/CameraController';

// Add FarmUI interface to window
declare global {
  interface Window {
    farmUI?: FarmUIInterface;
    farmCameraController?: {
      goToView: (viewId: string) => void;
      getCurrentView: () => string;
      isTransitioning: () => boolean;
      getViewpoints: () => CameraPosition[];
      resetControls: () => void;
    };
  }
}

interface NavigationMarkerProps {
  locationId: string;
  position: [number, number, number];
  label: string;
  icon?: React.ReactNode;
  hoverOffset?: number;
  markerSize?: number;
  color?: string;
  showCloseButton?: boolean;
}

// Hàm helper để lấy icon phù hợp cho từng loại location
const getIconForLocation = (locationId: string): string => {
  switch(locationId) {
    case 'overview':
      return '🏠'; // Home icon
    case 'cornfield':
      return '🌽'; // Corn icon
    case 'house':
      return '🏡'; // House icon
    default:
      return '📍'; // Default location pin
  }
};

const NavigationMarker: React.FC<NavigationMarkerProps> = ({
  locationId,
  position,
  label,
  markerSize = 1.2,
  color,
}) => {
  const [hovered, setHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    console.log(`[NavigationMarker] Clicked on ${locationId}`);
    e.stopPropagation();
    setIsClicked(true);
    
    // Hiệu ứng pulse với nhiều giai đoạn để trông đẹp hơn
    setTimeout(() => setIsClicked(false), 1000);
    
    // Chuyển camera tới view
    if (window.farmCameraController) {
      console.log(`[NavigationMarker] Calling farmCameraController.goToView(${locationId})`);
      window.farmCameraController.goToView(locationId);
    } else {
      console.error('[NavigationMarker] farmCameraController is undefined');
    }
      // Hiện panel phù hợp sau khi camera hoàn tất di chuyển
    setTimeout(() => {
      if (locationId === 'cornfield' && typeof window.farmUI?.setSelectedCornField === 'function') {
        console.log('[NavigationMarker] Setting selected corn field to true');
        window.farmUI?.setSelectedCornField?.(true);
      } else if (locationId === 'house' && window.farmUI) {
        console.log('[NavigationMarker] Showing house panel');
        window.farmUI.showPanel('house');
      }
    }, 1000); // Đảm bảo camera đã tới nơi
  }, [locationId]);

  // Tính toán kích thước dựa trên markerSize
  const baseSize = markerSize * 15; // Quy đổi từ giá trị markerSize sang pixel

  return (
    <Html
      position={position}
      center
      distanceFactor={18}
      prepend
      style={{ pointerEvents: 'auto' }}
      zIndexRange={[100, 0]}
    >
      <div 
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          boxShadow: isClicked 
            ? '0px 0px 10px rgba(255,255,255,0.8), 0px 0px 15px rgba(0,128,255,0.6)'
            : '0px 2px 6px rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '6px',
          paddingBottom: hovered ? '8px' : '6px',
          minWidth: `${baseSize}px`,
          minHeight: `${baseSize}px`,
          opacity: hovered ? 1 : 0.95,
          transform: `translateY(${hovered ? '-3px' : '0px'})`,
          transition: 'all 0.3s ease-out',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        {/* Icon phù hợp với từng loại location */}
        <div style={{
          fontSize: `${baseSize * 0.5}px`,
          color: color || '#63a24b',
          lineHeight: 1,
          marginBottom: hovered ? '4px' : '0px'
        }}>
          {getIconForLocation(locationId)}
        </div>
        
        {/* Hiển thị nhãn chỉ khi hover */}
        {hovered && (
          <div style={{ 
            fontWeight: 'bold', 
            color: '#333', 
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '2px',
            maxWidth: '80px',
            whiteSpace: 'nowrap'
          }}>
            {label}
          </div>
        )}
      </div>
    </Html>
  );
};

export default NavigationMarker;
