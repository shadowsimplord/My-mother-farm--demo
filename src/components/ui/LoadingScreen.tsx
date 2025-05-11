import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  children?: React.ReactNode;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  transparentLoader?: boolean; // giữ lại để không gây lỗi khi các nơi khác truyền prop này
}

/**
 * Component hiển thị màn hình loading cho toàn ứng dụng hoặc spinner nhỏ
 * Có thể dùng như màn hình loading toàn trang hoặc chỉ spinner nhỏ
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  children,
  text = 'Đang tải...',
  size = 'medium',
  color = '#4CAF50',
  fullScreen = true,
  transparent = false,
  transparentLoader = false
}) => {
  // State quản lý loading (chỉ dùng khi là màn hình loading toàn trang)
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Khởi động ứng dụng...');
  const [error, setError] = useState<Error | null>(null);

  // Nếu có children => là màn hình loading toàn trang, còn không thì chỉ là spinner
  const isScreen = !!children;

  // Giả lập quá trình tải tài nguyên game (chỉ khi là màn hình loading toàn trang)
  useEffect(() => {
    if (!isScreen) return;
    let progressInterval: ReturnType<typeof setInterval>;
    const simulateLoading = async () => {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress === 25) {
            setLoadingMessage('Đang tải mô hình 3D...');
          } else if (newProgress === 50) {
            setLoadingMessage('Đang tạo địa hình...');
          } else if (newProgress === 75) {
            setLoadingMessage('Chuẩn bị trang trại...');
          } else if (newProgress >= 100) {
            setLoadingMessage('Hoàn tất!');
            clearInterval(progressInterval);
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            return 100;
          }
          return newProgress;
        });
      }, 30);
    };
    const initialDelay = setTimeout(() => {
      try {
        simulateLoading();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }, 1000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(progressInterval);
    };
  }, [isScreen]);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setIsLoading(true);
  };

  // Nếu là màn hình loading toàn trang và đã xong thì render children
  if (isScreen && !isLoading && !error) {
    return <>{children}</>;
  }

  // Tính toán thông báo hiển thị
  const displayMessage = error
    ? `Lỗi: ${error.message}`
    : isScreen
      ? loadingMessage || `Đang tải... ${Math.round(progress)}%`
      : text;

  // Xác định kích thước spinner theo class name
  const getContainerSize = () => {
    switch(size) {
      case 'small': return 'w-[100px]';
      case 'large': return 'w-[300px]';
      default: return 'w-[200px]'; // medium
    }
  };

  // Render spinner nhỏ nếu không phải loading toàn trang
  if (!isScreen) {
    return (
      <div className={`absolute top-0 left-0 ${fullScreen ? 'w-screen h-screen' : 'w-full h-full'} flex justify-center items-center ${fullScreen ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'} z-[1000]`}>
        <div className={`flex flex-col items-center justify-center ${getContainerSize()} p-5 rounded-lg ${transparent || transparentLoader ? 'bg-transparent shadow-none' : fullScreen ? 'bg-white shadow-lg' : 'bg-white/90'}`}>
          {text && <div className={`mt-4 ${transparent || transparentLoader ? `text-[${color}]` : 'text-gray-800'} font-sans ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-base'}`}>{text}</div>}
        </div>
      </div>
    );
  }

  // Render loading toàn trang
  return (
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center bg-[rgba(31,156,75,0.74)] z-[1000] backdrop-blur-md text-white flex-col text-center font-sans">
      {!error && (
        <>
          <h2 className="text-white text-4xl mb-5 m-0">My Mother Farm</h2>
          <div className="w-3/5 max-w-[400px] h-[10px] bg-white/20 rounded-md my-5 overflow-hidden">
            <div 
              className="h-full bg-farm-green rounded-md transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xl my-4">{displayMessage}</div>
          <div className="mt-5 text-sm opacity-70">
            © 2025 My Mother Farm - Đang tải tài nguyên game
          </div>
        </>
      )}
      {error && (
        <div className="bg-red-500/30 text-white p-5 rounded-lg mt-5 max-w-[400px] text-center">
          <h3 className="font-bold text-xl">Đã xảy ra lỗi</h3>
          <p>{displayMessage}</p>
          <button 
            className="bg-farm-green border-none text-white py-2.5 px-5 rounded mt-4 cursor-pointer font-bold text-base hover:bg-[#3d8d40]"
            onClick={handleRetry}
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;