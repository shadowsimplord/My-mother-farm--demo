import React, { useEffect, useState } from 'react';
import NavigationMarker from './NavigationMarker';
import { CameraPosition, FARM_VIEWPOINTS } from '../../controls/CameraController';

// Custom positions and appearance for navigation markers
const MARKER_CONFIG: Record<string, {
  heightOffset: number,
  markerSize: number,
  color?: string,
  useSpecialPosition?: boolean,
  position?: [number, number, number]
}> = {
  cornfield: { 
    heightOffset: 2.3,     // Giảm độ cao để gần vườn ngô hơn
    markerSize: 1.7,       // Larger size to make it more prominent
    color: '#63a24b',      // Corn green color
    useSpecialPosition: true,
    position: [8.5, 2.5, 6.5]  // Di chuyển vị trí gần với vườn ngô hơn
  },
};

const NavigationMarkers: React.FC = () => {
  const [viewpoints, setViewpoints] = useState<CameraPosition[]>([]);

  useEffect(() => {
    // Get viewpoints from controller
    if (window.farmCameraController) {
      const points = window.farmCameraController.getViewpoints().filter(
        (view) => view.name && view.id
      );
      setViewpoints(points);
    } else {
      // Use hardcoded viewpoints as fallback
      setViewpoints(FARM_VIEWPOINTS);
    }
  }, []);
  return (
    <>
      {viewpoints
        .filter(viewpoint => viewpoint.id === 'cornfield')
        .map((viewpoint) => {
          // Get marker configuration for cornfield
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
