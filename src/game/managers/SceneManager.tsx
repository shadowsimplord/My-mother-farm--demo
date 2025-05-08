import { useState, useEffect } from 'react';
import { TreeInfo } from '../types';
import CornPlantInfoPanel from '../../components/ui/CornPlantInfoPanel';
import WorldScene from '../../scenes/WorldScene';
import FarmUI from '../../scenes/FarmUI';
import LoadingScreen from '../../components/ui/LoadingScreen';

// Enum các scene để quản lý dễ dàng
export enum SceneType {
  FARM = 'farm',
  CORN_GARDEN = 'corn-garden',
  // Có thể thêm nhiều scene khác ở đây trong tương lai (coffee, cherry, v.v.)
}

// Hook quản lý Scene và trạng thái
export function useSceneManager() {
  // State để quản lý scene hiện tại
  const [currentScene, setCurrentScene] = useState<SceneType>(SceneType.FARM);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // State cho CornGardenScene
  const [selectedCornPlant, setSelectedCornPlant] = useState<TreeInfo | null>(null);
  
  // Lắng nghe sự kiện chuyển scene
  useEffect(() => {
    const handleSceneTransition = (e: CustomEvent) => {
      if (e.detail && e.detail.targetScene) {
        console.log(`Changing to scene: ${e.detail.targetScene}`);
        
        // Start transition with loading screen
        setIsTransitioning(true);
        
        // Delay scene change to show loading animation
        setTimeout(() => {
          setCurrentScene(e.detail.targetScene);
          
          // After scene loads, remove loading screen with a delay
          setTimeout(() => {
            setIsTransitioning(false);
          }, 1000);
        }, 800);
      }
    };
    
    const handleReturnToFarm = () => {
      console.log('Returning to main farm');
      
      // Start transition with loading screen
      setIsTransitioning(true);
      
      // Delay scene change to show loading animation
      setTimeout(() => {
        setCurrentScene(SceneType.FARM);
        
        // After scene loads, remove loading screen with a delay
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }, 800);
    };
    
    const handleCornPlantSelected = (e: CustomEvent<TreeInfo>) => {
      console.log('[SceneManager] Received selected corn plant:', e.detail);
      setSelectedCornPlant(e.detail);
    };
    
    window.addEventListener('prepare-scene-transition', handleSceneTransition as EventListener);
    window.addEventListener('return-to-farm', handleReturnToFarm as EventListener);
    window.addEventListener('corn-plant-selected', handleCornPlantSelected as EventListener);
    
    return () => {
      window.removeEventListener('prepare-scene-transition', handleSceneTransition as EventListener);
      window.removeEventListener('return-to-farm', handleReturnToFarm as EventListener);
      window.removeEventListener('corn-plant-selected', handleCornPlantSelected as EventListener);
    };
  }, []);
  
  // Đóng bảng thông tin cây ngô
  const handleClosePlantInfo = () => {
    setSelectedCornPlant(null);
  };
  
  // Loading screen overlay for transitions
  const TransitionLoadingOverlay = () => {
    if (!isTransitioning) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
      }}>
        <LoadingScreen transparentLoader={true}>
          <div style={{ display: 'none' }}></div>
        </LoadingScreen>
      </div>
    );
  };
  
  return {
    currentScene,
    isTransitioning,
    selectedCornPlant,
    handleClosePlantInfo,
    TransitionLoadingOverlay,
  };
}

// Component chính để render scene
export const SceneRenderer: React.FC = () => {
  const {
    currentScene,
    selectedCornPlant,
    handleClosePlantInfo,
    TransitionLoadingOverlay,
  } = useSceneManager();
  
  // Luôn tạo WorldScene
  return (
    <>
      <FarmUI currentScene={currentScene}>
        <WorldScene currentScene={currentScene} />
      </FarmUI>
      
      {/* Hiển thị bảng thông tin cây ngô khi được chọn */}
      {currentScene === SceneType.CORN_GARDEN && selectedCornPlant && (
        <div style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none', // Ngăn click events ở nền
          zIndex: 10
        }}>
          <div style={{ pointerEvents: 'auto' }}> {/* Wrapper mới để cho phép click events */}
            <CornPlantInfoPanel 
              plant={selectedCornPlant} 
              onClose={handleClosePlantInfo}
            />
          </div>
        </div>
      )}
      
      <TransitionLoadingOverlay />
    </>
  );
};