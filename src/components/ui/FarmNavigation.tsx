import React, { useEffect, useState } from 'react';
import { CameraPosition } from '../../game/controllers/CameraController';

interface FarmNavigationProps {
  position?: 'left' | 'right';
}

const FarmNavigation: React.FC<FarmNavigationProps> = ({ /* position không được sử dụng */ }) => {
  const [viewpoints, setViewpoints] = useState<CameraPosition[]>([]);
  const [currentView, setCurrentView] = useState<string>('overview');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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
    if (window.farmCameraController && !window.farmCameraController.isTransitioning()) {
      try {
        // Use the camera controller to move to the selected view
        window.farmCameraController.goToView(viewId);
      } catch (e) {
        console.error('[FarmNavigation] Error calling goToView:', e);
        // Fallback to event if method call fails
        window.dispatchEvent(new CustomEvent('change-view', {
          detail: { viewId }
        }));
      }
    } else {
      console.log('[FarmNavigation] CameraController not available or transitioning, using event dispatch');
      // Dispatch event for CameraController to handle
      window.dispatchEvent(new CustomEvent('change-view', {
        detail: { viewId }
      }));
    }
  };

  // Tạo icon và hình ảnh dựa trên ID của viewpoint
  const getIconForView = (viewId: string): React.ReactNode => {
    switch(viewId.toLowerCase()) {
      case 'overview':
        return (
          <div className="view-icon">
            <span role="img" aria-label="Overview">🔍</span>
          </div>
        );
      case 'house':
        return (
          <div className="view-icon">
            <span role="img" aria-label="House">🏠</span>
          </div>
        );
      case 'coffee': case 'coffeearea':
        return (
          <div className="view-icon">
            <span role="img" aria-label="Coffee">☕</span>
          </div>
        );
      case 'cherry': case 'cherryarea':
        return (
          <div className="view-icon">
            <span role="img" aria-label="Cherry">🍒</span>
          </div>
        );
      case 'forest':
        return (
          <div className="view-icon">
            <span role="img" aria-label="Forest">🌳</span>
          </div>
        );
      case 'cornfield':
        return (
          <div className="view-icon">
            <span role="img" aria-label="Corn Field">🌽</span>
          </div>
        );
      default:
        return (
          <div className="view-icon">
            <span role="img" aria-label="Location">📍</span>
          </div>
        );
    }
  };

  // Thiết lập style cho menu navigation theo trang web dairyfarmersofcanada.ca
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '15px 25px',
    borderRadius: '50px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
  };

  const buttonOuterStyle: React.CSSProperties = {
    position: 'relative',
    margin: '0 5px',
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    background: isActive ? '#e9f4e3' : 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    boxShadow: isActive 
      ? '0 0 0 3px #63a24b, 0 8px 16px rgba(99, 162, 75, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  });

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  };

  const tooltipStyle = (viewId: string): React.CSSProperties => ({
    position: 'absolute',
    bottom: '90px', // Thay đổi vị trí tooltip từ trên xuống dưới
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4a7e38',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: showTooltip === viewId ? 1 : 0,
    transition: 'opacity 0.3s ease',
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  });

  // Thêm mũi tên tam giác chỉ xuống từ tooltip
  const tooltipArrowStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid #4a7e38',
  };

  // Thêm wave effect cho chỉ báo viewpoint active
  const waveEffectStyle = (isActive: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '-15px',
    left: '-15px',
    right: '-15px',
    bottom: '-15px',
    borderRadius: '50%',
    border: '3px solid #63a24b',
    opacity: isActive ? 0.6 : 0,
    animation: isActive ? 'wavePulse 2s infinite' : 'none',
    pointerEvents: 'none',
  });

  // Kiểm tra xem có viewpoints để hiển thị không
  if (viewpoints.length === 0) {
    return null; // Không render gì nếu không có viewpoints
  }

  return (
    <>
      <style>{`
        @keyframes wavePulse {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.1);
            opacity: 0;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
      <div style={containerStyle}>
        {viewpoints.map((view) => (
          <div key={view.id} style={buttonOuterStyle}>
            <button
              onClick={() => handleViewSelect(view.id)}
              style={buttonStyle(currentView === view.id)}
              onMouseEnter={() => setShowTooltip(view.id)}
              onMouseLeave={() => setShowTooltip(null)}
              aria-label={view.name}
            >
              <div style={iconStyle}>
                {getIconForView(view.id)}
              </div>
              <div style={waveEffectStyle(currentView === view.id)}></div>
            </button>
            {showTooltip === view.id && (
              <div style={tooltipStyle(view.id)}>
                {view.name}
                <div style={tooltipArrowStyle}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FarmNavigation;
