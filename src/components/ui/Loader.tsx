import React from 'react';

interface LoaderProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

/**
 * Component hiển thị animation loading
 * Có thể sử dụng trong khi tải model 3D hoặc dữ liệu
 */
const Loader: React.FC<LoaderProps> = ({
  text = 'Đang tải...',
  size = 'medium',
  color = '#4CAF50', 
  fullScreen = false,
  transparent = false
}) => {
  // Xác định kích thước dựa vào prop
  const getSizeValue = () => {
    switch(size) {
      case 'small': return { container: 100, spinner: 30 };
      case 'large': return { container: 300, spinner: 70 };
      default: return { container: 200, spinner: 50 };
    }
  };
  
  const sizeValue = getSizeValue();

  // Styles cho loader
  const styles = {
    overlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: fullScreen ? '100vw' : '100%',
      height: fullScreen ? '100vh' : '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: fullScreen ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
      zIndex: 1000,
      backdropFilter: fullScreen ? 'blur(5px)' : 'none',
    },
    container: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: sizeValue.container,
      padding: 20,
      borderRadius: 10,
      backgroundColor: transparent ? 'transparent' : (fullScreen ? 'white' : 'rgba(255, 255, 255, 0.9)'),
      boxShadow: transparent ? 'none' : (fullScreen ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none'),
    },
    spinner: {
      width: sizeValue.spinner,
      height: sizeValue.spinner,
      border: transparent ? `4px solid transparent` : `4px solid rgba(0, 0, 0, 0.1)`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    text: {
      marginTop: 15,
      color: transparent ? color : '#333',
      fontFamily: 'Arial, sans-serif',
      fontSize: size === 'small' ? 14 : size === 'large' ? 20 : 16,
    }
  };

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        {text && <div style={styles.text}>{text}</div>}
      </div>
    </div>
  );
};

export default Loader;