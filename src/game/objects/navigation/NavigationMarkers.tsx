import React, { useEffect, useState } from 'react';
import NavigationMarker from './NavigationMarker';
import { CameraPosition, FARM_VIEWPOINTS } from '../../../components/controls/CameraController';
import { FarmUIInterface } from '../../../components/ui/FarmUI';

// Add FarmUI interface to window if not already defined
declare global {
  interface Window {
    farmUI?: FarmUIInterface;
  }
}

// Custom positions and appearance for navigation markers
const MARKER_CONFIG: Record<string, {
  heightOffset: number,
  markerSize: number,
  color?: string,
  useSpecialPosition?: boolean,
  position?: [number, number, number]
}> = {
  cornfield: { 
    heightOffset: 2.5,     // Giảm độ cao để gần vườn ngô hơn
    markerSize: 2.5,       // Larger size to make it more prominent
    color: '#63a24b',      // Corn green color
    useSpecialPosition: true,
    position: [8, 2.5, 6]  // Di chuyển vị trí gần với vườn ngô hơn
  },  house: {
    heightOffset: 3.0,
    markerSize: 1.8,
    color: '#8B4513',  // Brown color for house
    useSpecialPosition: true,
    position: [2, 2.5, 3]  // Điều chỉnh theo vị trí nhà mới (y = -0.5 + 3.0 = 2.5)
  }
};

const NavigationMarkers: React.FC = () => {
  const [viewpoints, setViewpoints] = useState<CameraPosition[]>([]);
  // Tối ưu performance bằng cách memoize viewpoints và giảm re-renders
  const [markersInitialized, setMarkersInitialized] = useState(false);

  useEffect(() => {
    // Chỉ tải viewpoints một lần và caching chúng để tránh re-renders không cần thiết
    if (!markersInitialized) {
      console.log('[NavigationMarkers] Initializing markers');
      
      if (window.farmCameraController) {
        // Lọc viewpoints có đầy đủ thông tin cần thiết
        const points = window.farmCameraController.getViewpoints().filter(
          (view) => view.name && view.id && MARKER_CONFIG[view.id]
        );
        setViewpoints(points);
      } else {
        // Fallback khi không có farmCameraController
        const fallbackPoints = FARM_VIEWPOINTS.filter(
          view => view.name && view.id && MARKER_CONFIG[view.id]
        );
        setViewpoints(fallbackPoints);
      }
      
      setMarkersInitialized(true);
    }
  }, [markersInitialized]);  

  return (
    <>
      {viewpoints
        // Hiển thị marker cho tất cả các location có trong MARKER_CONFIG
        .filter(viewpoint => viewpoint.id && MARKER_CONFIG[viewpoint.id])
        .map((viewpoint) => {
          // Get marker configuration for this location
          const config = MARKER_CONFIG[viewpoint.id] || { 
            heightOffset: 3, 
            markerSize: 1.2 
          };
          
          // Determine marker position
          let markerPosition: [number, number, number];
          
          if (config.useSpecialPosition && config.position) {
            // Use a special predefined position
            markerPosition = config.position;
          } else {
            // Position marker above the target location
            markerPosition = [
              viewpoint.target[0],
              viewpoint.target[1] + config.heightOffset,
              viewpoint.target[2]
            ];
          }
          
          return (
            <NavigationMarker
              key={viewpoint.id}
              locationId={viewpoint.id}
              position={markerPosition}
              label={viewpoint.name}
              markerSize={config.markerSize}
              color={config.color}
              showCloseButton={true}
            />
          );
        })}
    </>
  );
};

export default NavigationMarkers;
