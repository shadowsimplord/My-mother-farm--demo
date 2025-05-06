import React, { useEffect, useState } from 'react';
import { CameraPosition } from '../../game/controllers/CameraController';

interface FarmNavigationProps {
  position?: 'left' | 'right';
}

const FarmNavigation: React.FC<FarmNavigationProps> = ({ position = 'left' }) => {
  const [viewpoints, setViewpoints] = useState<CameraPosition[]>([]);
  const [currentView, setCurrentView] = useState<string>('overview');
  const [isVisible, setIsVisible] = useState(true);

  // Lấy các viewpoints từ CameraController khi component mount
  useEffect(() => {
    // Kiểm tra controller và lấy viewpoints
    const getControllerData = () => {
      if (window.farmCameraController) {
        console.log('[FarmNavigation] Fetching viewpoints from controller');
        try {
          // Lọc các viewpoints để đảm bảo chỉ hiển thị những viewpoint có tên
          const filteredViewpoints = window.farmCameraController.getViewpoints().filter(
            (view) => view.name && view.id
          );
          setViewpoints(filteredViewpoints);
          
          // Get current view - safely handle errors
          try {
            const currentViewId = window.farmCameraController.getCurrentView();
            setCurrentView(currentViewId);
          } catch (e) {
            console.warn('[FarmNavigation] Could not get current view:', e);
          }
          
          // Successfully connected
          return true;
        } catch (e) {
          console.warn('[FarmNavigation] Error accessing controller methods:', e);
          return false;
        }
      } else {
        console.log('[FarmNavigation] Controller not available yet, retrying in 1s');
        return false;
      }
    };
    
    // Try to get controller data immediately
    if (!getControllerData()) {
      // If failed, set up polling with a max number of retries
      let retries = 0;
      const maxRetries = 10;
      const interval = setInterval(() => {
        if (getControllerData() || retries >= maxRetries) {
          clearInterval(interval);
        }
        retries++;
      }, 1000);
    }
    
    // Lắng nghe sự kiện khi view thay đổi để cập nhật UI
    const handleViewChanging = (e: CustomEvent) => {
      if (e.detail && e.detail.toViewId) {
        console.log(`[FarmNavigation] View changing to: ${e.detail.toViewId}`);
        setCurrentView(e.detail.toViewId);
      }
    };
    
    const handleViewChanged = (e: CustomEvent) => {
      if (e.detail && e.detail.viewId) {
        console.log(`[FarmNavigation] View changed to: ${e.detail.viewId}`);
        setCurrentView(e.detail.viewId);
      }
    };
    
    window.addEventListener('view-changing', handleViewChanging as EventListener);
    window.addEventListener('view-changed', handleViewChanged as EventListener);
    
    return () => {
      window.removeEventListener('view-changing', handleViewChanging as EventListener);
      window.removeEventListener('view-changed', handleViewChanged as EventListener);
    };
  }, []);

  // Xử lý khi chọn view
  const handleViewSelect = (viewId: string) => {
    console.log(`[FarmNavigation] Selected view: ${viewId}`);
    if (window.farmCameraController) {
      try {
        window.farmCameraController.goToView(viewId);
      } catch (e) {
        console.error('[FarmNavigation] Error calling goToView:', e);
        // Fallback to event if method call fails
        window.dispatchEvent(new CustomEvent('change-view', {
          detail: { viewId }
        }));
      }
    } else {
      console.error('[FarmNavigation] farmCameraController is not available');
      // Dispatch event for CameraController to handle
      window.dispatchEvent(new CustomEvent('change-view', {
        detail: { viewId }
      }));
    }
  };

  // Tạo icon dựa trên ID của viewpoint
  const getIconForView = (viewId: string): string => {
    switch(viewId.toLowerCase()) {
      case 'overview': return '🔍';
      case 'house': return '🏠';
      case 'coffee': case 'coffeearea': return '☕';
      case 'cherry': case 'cherryarea': return '🍒';
      case 'forest': return '🌳';
      case 'corn': case 'cornarea': return '🌽';
      default: return '📍';
    }
  };

  // Thiết lập style cho menu navigation
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [position]: '20px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'opacity 0.3s ease',
    opacity: isVisible ? 1 : 0.3,
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '12px 15px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  };

  // Nút toggle hiển thị
  const toggleButton: React.CSSProperties = {
    position: 'absolute',
    bottom: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '0 0 8px 8px',
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    border: 'none',
  };

  // Kiểm tra xem có viewpoints để hiển thị không
  if (viewpoints.length === 0) {
    return null; // Không render gì nếu không có viewpoints
  }

  // Thiết kế các button với animation mượt mà
  return (
    <div 
      style={containerStyle} 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {viewpoints.map((view) => (
        <button
          key={view.id}
          onClick={() => handleViewSelect(view.id)}
          style={{
            ...buttonBaseStyle,
            backgroundColor: currentView === view.id 
              ? '#4CAF50' 
              : 'rgba(255, 255, 255, 0.7)',
            color: currentView === view.id 
              ? 'white' 
              : '#333',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.backgroundColor = currentView === view.id 
              ? '#45a049' 
              : 'rgba(240, 240, 240, 0.9)';
            target.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.backgroundColor = currentView === view.id 
              ? '#4CAF50' 
              : 'rgba(255, 255, 255, 0.7)';
            target.style.transform = 'scale(1)';
          }}
          title={view.description || view.name}
        >
          <span style={{ fontSize: '18px' }}>{getIconForView(view.id)}</span> {view.name}
        </button>
      ))}
      <button 
        style={toggleButton}
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? 'Thu gọn' : 'Mở rộng'}
      >
        {isVisible ? '▼' : '▲'}
      </button>
    </div>
  );
};

export default FarmNavigation;
