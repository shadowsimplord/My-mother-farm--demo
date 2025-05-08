import React from 'react';

interface FieldInfoPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onEnterCornGarden: () => void;
}

const FieldInfoPanel: React.FC<FieldInfoPanelProps> = ({ isVisible, onClose, onEnterCornGarden }) => {
  if (!isVisible) return null;

  // Styles cho panel
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
    transition: 'all 0.3s ease',
  };

  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(to bottom, #f8f8f8, #e8e8e8)',
    borderRadius: '12px',
    padding: '24px',
    width: '450px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    animation: 'fadeIn 0.3s ease-out',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2e7d32',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
  };

  const contentStyle: React.CSSProperties = {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#444',
    marginBottom: '8px',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '16px',
    backgroundColor: '#f0f0f0', // Placeholder
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '16px',
  };

  const mainButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...mainButtonStyle,
    backgroundColor: 'transparent',
    color: '#4caf50',
    border: '1px solid #4caf50',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Cánh Đồng Ngô</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <div style={imageStyle}>
          {/* Hình ảnh demo - có thể thay bằng hình thực tế */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#e0f2e0',
            fontSize: '50px'
          }}>
            🌽
          </div>
        </div>
        
        <div style={contentStyle}>
          <p>Cánh đồng ngô đang phát triển tốt và sẵn sàng để thu hoạch. Bạn có thể vào vườn ngô để kiểm tra tình trạng cây trồng và thu hoạch khi chúng đã sẵn sàng.</p>
          <p><strong>Trạng thái:</strong> Sẵn sàng thu hoạch</p>
          <p><strong>Loại cây:</strong> Ngô hybrid cao sản</p>
        </div>
        
        <div style={buttonContainerStyle}>
          <button 
            style={mainButtonStyle} 
            onClick={onEnterCornGarden}
            onMouseOver={(e) => {
              const target = e.currentTarget;
              target.style.backgroundColor = '#45a049';
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget;
              target.style.backgroundColor = '#4caf50';
              target.style.transform = 'translateY(0)';
            }}
          >
            <span>🌽</span> Vào Vườn Ngô
          </button>
          
          <button 
            style={secondaryButtonStyle} 
            onClick={onClose}
            onMouseOver={(e) => {
              const target = e.currentTarget;
              target.style.backgroundColor = '#f0fff0';
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget;
              target.style.backgroundColor = 'transparent';
              target.style.transform = 'translateY(0)';
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldInfoPanel;