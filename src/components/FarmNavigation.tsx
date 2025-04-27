import React, { useState, useEffect } from 'react';
import { FARM_VIEWPOINTS, CameraPosition } from '../game/controllers/CameraController';

interface FarmNavigationProps {
  position?: 'top' | 'left' | 'right' | 'bottom';
}

const FarmNavigation: React.FC<FarmNavigationProps> = ({ position = 'right' }) => {
  const [activeViewId, setActiveViewId] = useState<string>('overview');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [viewDescription, setViewDescription] = useState<string | undefined>(
    FARM_VIEWPOINTS.find(v => v.id === 'overview')?.description
  );
  
  useEffect(() => {
    const handleViewChanging = (e: CustomEvent) => {
      if (e.detail && e.detail.toViewId) {
        setActiveViewId(e.detail.toViewId);
        setViewDescription(e.detail.view?.description);
        setIsTransitioning(true);
        
        // Reset transitioning state after animation completes
        setTimeout(() => setIsTransitioning(false), 2000);
      }
    };
    
    window.addEventListener('view-changing', handleViewChanging as EventListener);
    
    return () => {
      window.removeEventListener('view-changing', handleViewChanging as EventListener);
    };
  }, []);
  
  const navigateToView = (viewId: string) => {
    if (window.farmCameraController && !isTransitioning) {
      window.farmCameraController.goToView(viewId);
    }
  };
  
  // Określ style na podstawie pozycji
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 100,
    display: 'flex',
    gap: '10px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: position === 'left' || position === 'right' ? '12px' : '0',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.3s ease',
  };
  
  // Dostosuj pozycję
  switch (position) {
    case 'top':
      containerStyle.top = '20px';
      containerStyle.left = '50%';
      containerStyle.transform = 'translateX(-50%)';
      containerStyle.flexDirection = 'row';
      containerStyle.borderRadius = '0 0 12px 12px';
      break;
    case 'left':
      containerStyle.left = '20px';
      containerStyle.top = '50%';
      containerStyle.transform = 'translateY(-50%)';
      containerStyle.flexDirection = 'column';
      break;
    case 'right':
      containerStyle.right = '20px';
      containerStyle.top = '50%';
      containerStyle.transform = 'translateY(-50%)';
      containerStyle.flexDirection = 'column';
      break;
    case 'bottom':
      containerStyle.bottom = '20px';
      containerStyle.left = '50%';
      containerStyle.transform = 'translateX(-50%)';
      containerStyle.flexDirection = 'row';
      containerStyle.borderRadius = '12px 12px 0 0';
      break;
  }
  
  return (
    <div style={containerStyle}>
      {FARM_VIEWPOINTS.map((viewpoint) => (
        <div 
          key={viewpoint.id} 
          onClick={() => navigateToView(viewpoint.id)}
          style={{
            padding: '10px 15px',
            backgroundColor: activeViewId === viewpoint.id ? '#4CAF50' : 'transparent',
            color: activeViewId === viewpoint.id ? 'white' : '#333',
            borderRadius: '8px',
            cursor: isTransitioning ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: activeViewId === viewpoint.id ? 'bold' : 'normal',
            opacity: isTransitioning && activeViewId !== viewpoint.id ? 0.5 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: activeViewId === viewpoint.id ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{viewpoint.name}</div>
          {activeViewId === viewpoint.id && viewpoint.description && (
            <div 
              style={{ 
                fontSize: '0.8rem', 
                maxWidth: '150px',
                textAlign: 'center',
                marginTop: '5px',
                animation: 'fadeIn 0.5s ease',
              }}
            >
              {viewpoint.description}
            </div>
          )}
        </div>
      ))}
      
      {/* Thay thế style jsx="true" bằng style thông thường */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default FarmNavigation;
