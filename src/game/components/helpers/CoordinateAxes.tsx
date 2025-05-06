import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CoordinateAxesProps {
  size?: number;
  visible?: boolean;
}

const CoordinateAxes = ({ size = 10, visible = false }: CoordinateAxesProps) => {
  const axesRef = useRef<THREE.AxesHelper>(null);

  useEffect(() => {
    const handleToggleAxes = (e: CustomEvent<{ visible: boolean }>) => {
      if (axesRef.current) {
        axesRef.current.visible = e.detail.visible;
      }
    };
    window.addEventListener('toggle-axes', handleToggleAxes as EventListener);
    return () => {
      window.removeEventListener('toggle-axes', handleToggleAxes as EventListener);
    };
  }, []);

  return <axesHelper ref={axesRef} args={[size]} visible={visible} />;
};

export default CoordinateAxes;
