import React, { useState, useEffect } from 'react';
import Loader from './Loader';

interface LoadingScreenProps {
  children?: React.ReactNode;
  transparentLoader?: boolean;
}

/**
 * Component hiển thị màn hình loading cho toàn ứng dụng
 * Tự quản lý logic loading
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  children,
  transparentLoader = false
}) => {
  // State quản lý loading
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Khởi động ứng dụng...');
  const [error, setError] = useState<Error | null>(null);
  
  // Giả lập quá trình tải tài nguyên game
  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    
    const simulateLoading = async () => {
      // Tăng tiến độ loading dần dần
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          
          // Cập nhật thông báo dựa vào tiến độ
          if (newProgress === 25) {
            setLoadingMessage('Đang tải mô hình 3D...');
          } else if (newProgress === 50) {
            setLoadingMessage('Đang tạo địa hình...');
          } else if (newProgress === 75) {
            setLoadingMessage('Chuẩn bị trang trại...');
          } else if (newProgress >= 100) {
            setLoadingMessage('Hoàn tất!');
            clearInterval(progressInterval);
            
            // Kết thúc loading sau 0.5 giây
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            
            return 100;
          }
          
          return newProgress;
        });
      }, 30); // Tăng tiến độ mỗi 30ms
    };
    
    // Chờ 1 giây trước khi bắt đầu giả lập loading
    const initialDelay = setTimeout(() => {
      try {
        simulateLoading();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }, 1000);
    
    // Cleanup effect
    return () => {
      clearTimeout(initialDelay);
      clearInterval(progressInterval);
    };
  }, []);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setIsLoading(true);
  };

  // Nếu không còn loading và không có lỗi, hiển thị children
  if (!isLoading && !error) {
    return <>{children}</>;
  }

  // Tính toán thông báo hiển thị
  const displayMessage = error 
    ? `Lỗi: ${error.message}` 
    : loadingMessage || `Đang tải... ${Math.round(progress)}%`;

  // Styles cho màn hình loading
  const styles = {
    container: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9999,
      backdropFilter: 'blur(5px)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    },
    progressContainer: {
      width: '60%',
      maxWidth: 400,
      height: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 5,
      margin: '20px 0',
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      width: `${progress}%`,
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      transition: 'width 0.3s ease',
    },
    errorContainer: {
      background: 'rgba(255, 0, 0, 0.2)',
      padding: 20,
      borderRadius: 8,
      marginTop: 20,
      maxWidth: 400,
      textAlign: 'center' as const,
    },
    retryButton: {
      backgroundColor: '#4CAF50',
      border: 'none',
      color: 'white',
      padding: '10px 20px',
      borderRadius: 5,
      marginTop: 15,
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: 16,
    },
  };

  return (
    <div style={styles.container}>
      {!error && (
        <>
          <h2>My Mother Farm</h2>
          <Loader text="" size="large" color="#4CAF50" transparent={transparentLoader} />
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}></div>
          </div>
          <div>{displayMessage}</div>
          <div style={{ marginTop: 20, fontSize: 14, opacity: 0.7 }}>
            © 2025 My Mother Farm - Đang tải tài nguyên game
          </div>
        </>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <h3>Đã xảy ra lỗi</h3>
          <p>{displayMessage}</p>
          <button style={styles.retryButton} onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;