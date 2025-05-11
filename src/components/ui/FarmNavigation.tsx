import React, { useEffect, useState } from 'react';
import { CameraPosition } from '../controls/CameraController';

interface FarmNavigationProps {
  position?: 'left' | 'right';
}

const FarmNavigation: React.FC<FarmNavigationProps> = ({ /* position không được sử dụng */ }) => {
  const [viewpoints, setViewpoints] = useState<CameraPosition[]>([]);
  const [currentView, setCurrentView] = useState<string>('overview');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Lấy các viewpoints từ CameraController khi component mount
  useEffect(() => {
    const getControllerData = () => {
      if (window.farmCameraController) {
        console.log('[FarmNavigation] Fetching viewpoints from controller');
        try {
          const filteredViewpoints = window.farmCameraController.getViewpoints().filter(
            (view) => view.name && view.id
          );
          setViewpoints(filteredViewpoints);

          try {
            const currentViewId = window.farmCameraController.getCurrentView();
            setCurrentView(currentViewId);
          } catch (e) {
            console.warn('[FarmNavigation] Could not get current view:', e);
          }

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

    if (!getControllerData()) {
      let retries = 0;
      const maxRetries = 10;
      const interval = setInterval(() => {
        if (getControllerData() || retries >= maxRetries) {
          clearInterval(interval);
        }
        retries++;
      }, 1000);
    }

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

  const handleViewSelect = (viewId: string) => {
    console.log(`[FarmNavigation] Selected view: ${viewId}`);
    if (window.farmCameraController && !window.farmCameraController.isTransitioning()) {
      try {
        window.farmCameraController.goToView(viewId);
      } catch (e) {
        console.error('[FarmNavigation] Error calling goToView:', e);
        window.dispatchEvent(new CustomEvent('change-view', {
          detail: { viewId }
        }));
      }
    } else {
      console.log('[FarmNavigation] CameraController not available or transitioning, using event dispatch');
      window.dispatchEvent(new CustomEvent('change-view', {
        detail: { viewId }
      }));
    }
  };

  const getIconForView = (viewId: string): React.ReactNode => {
    switch(viewId.toLowerCase()) {
      case 'overview':
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="Overview">🔍</span>
          </div>
        );
      case 'house':
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="House">🏠</span>
          </div>
        );
      case 'coffee': case 'coffeearea':
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="Coffee">☕</span>
          </div>
        );
      case 'cherry': case 'cherryarea':
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="Cherry">🍒</span>
          </div>
        );
      case 'forest':
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="Forest">🌳</span>
          </div>
        );
      case 'cornfield':
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="Corn Field">🌽</span>
          </div>
        );
      default:
        return (
          <div className="flex justify-center items-center">
            <span role="img" aria-label="Location">📍</span>
          </div>
        );
    }
  };

  if (viewpoints.length === 0) {
    return null;
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
      <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md py-[15px] px-[25px] rounded-[50px] shadow-lg z-100 flex flex-row justify-center gap-5 transition-all duration-300">
        {viewpoints.map((view) => (
          <div key={view.id} className="relative mx-[5px]">
            <button
              onClick={() => handleViewSelect(view.id)}
              className={`w-[75px] h-[75px] rounded-full border-none cursor-pointer flex justify-center items-center text-[28px] overflow-hidden p-0 relative transition-all duration-300
                ${currentView === view.id ? 
                  'bg-[#e9f4e3] shadow-[0_0_0_3px_#63a24b,0_8px_16px_rgba(99,162,75,0.3)]' : 
                  'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]'}`}
              onMouseEnter={() => setShowTooltip(view.id)}
              onMouseLeave={() => setShowTooltip(null)}
              aria-label={view.name}
            >
              <div className="flex justify-center items-center w-full h-full">
                {getIconForView(view.id)}
              </div>
              <div className={`absolute -top-[15px] -left-[15px] -right-[15px] -bottom-[15px] rounded-full border-[3px] border-[#63a24b] pointer-events-none
                ${currentView === view.id ? 'opacity-60 animate-[wavePulse_2s_infinite]' : 'opacity-0'}`}></div>
            </button>
            {showTooltip === view.id && (
              <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 bg-[#4a7e38] text-white py-[6px] px-[14px] rounded-lg text-[15px] font-medium whitespace-nowrap pointer-events-none z-[1000] shadow-md transition-opacity duration-300">
                {view.name}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#4a7e38]"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FarmNavigation;
