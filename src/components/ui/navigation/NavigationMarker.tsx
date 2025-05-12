import React, { useState, useRef, useEffect } from 'react';

import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { FarmUIInterface } from '../FarmUI';

// Add FarmUI interface to window
declare global {
  interface Window {
    farmUI?: FarmUIInterface;
  }
}

interface NavigationMarkerProps {
  locationId: string;
  position: [number, number, number];
  label: string;
  icon?: React.ReactNode;
  markerSize?: number;
  color?: string;
  showCloseButton?: boolean;
}

const NavigationMarker: React.FC<NavigationMarkerProps> = ({
  locationId,
  position,

}) => {


  const markerRef = useRef<THREE.Group>(null);
  const [currentViewId, setCurrentViewId] = useState<string>('overview');

  // Setup event listeners
  useEffect(() => {
    const handleViewChanged = (e: CustomEvent) => {
      if (e.detail && e.detail.viewId) {
        setCurrentViewId(e.detail.viewId);
      }
    };

    window.addEventListener('view-changed', handleViewChanged as EventListener);

    return () => {
      window.removeEventListener('view-changed', handleViewChanged as EventListener);
    };
  }, [locationId]);

  // Handle marker click
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log(`[NavigationMarker] Marker clicked: ${locationId}`);

    // Navigate to this location
    if (window.farmCameraController) {
      window.farmCameraController.goToView(locationId);

      // Show the information panel for the clicked location
      setTimeout(() => {
        if (window.farmUI && window.farmUI.showPanel) {
          window.farmUI.showPanel(locationId);
        } else {
          console.warn('[NavigationMarker] farmUI or showPanel is not available');
        }
      }, 1000); // Delay to ensure camera transition completes
    }
  };

  // Animate marker with enhanced effects
  useFrame((state) => {
    if (markerRef.current) {
      // Enhanced floating animation
      const time = state.clock.getElapsedTime();

      // More pronounced floating effect for overview state
      const floatAmplitude = currentViewId === 'overview' ? 0.25 : 0.15;
      const yOffset = Math.sin(time * 1.2) * floatAmplitude;

      // Gentle rotation effect
      if (currentViewId === 'overview') {
        markerRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      }

      // Set base position
      const baseY = position[1]; // Removed hover effect as 'hovered' is no longer used
      markerRef.current.position.y = baseY + yOffset;

      // Always face camera
      markerRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <group
      position={position}
      onClick={handleClick}
    >
      {/* Add a simple marker representation */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
};

export default NavigationMarker;
