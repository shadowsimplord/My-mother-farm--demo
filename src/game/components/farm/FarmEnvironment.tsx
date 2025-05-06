import { Sky, Environment } from '@react-three/drei';

const FarmEnvironment = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1} 
        castShadow={true} 
        shadow-mapSize={[2048, 2048]}
      />
      
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="sunset" />
    </>
  );
};

export default FarmEnvironment;