import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface OriginPointProps {
  size?: number;
  visible?: boolean;
}

const OriginPoint = ({ size = 0.2, visible = false }: OriginPointProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const handleToggleAxes = (e: CustomEvent<{ visible: boolean }>) => {
      if (meshRef.current) {
        meshRef.current.visible = e.detail.visible;
      }
    };
    window.addEventListener('toggle-axes', handleToggleAxes as EventListener);
    return () => {
      window.removeEventListener('toggle-axes', handleToggleAxes as EventListener);
    };
  }, []);

  return (
    <mesh ref={meshRef} visible={visible} position={[0, 0, 0]}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

export default OriginPoint;
