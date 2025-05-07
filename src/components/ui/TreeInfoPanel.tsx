import React from 'react';
import { TreeInfoExtended, getStatusColor, getStatusLabel, calculateYield, calculatePrice } from '../../game/utils/treeInfoHelpers';

interface TreeInfoPanelProps {
  tree: TreeInfoExtended | null;
  onClose: () => void;
}

const TreeInfoPanel: React.FC<TreeInfoPanelProps> = ({ tree, onClose }) => {
  if (!tree) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: 20,
      transform: 'translateY(-50%)',
      width: '300px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 128, 0, 0.3)',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #4CAF50',
        paddingBottom: 10,
        marginBottom: 15
      }}>
        <h2 style={{ margin: 0, color: '#2E7D32', fontSize: '1.4rem' }}>
          {tree.type === 'cherry' ? 'Cây Anh Đào ' : 
           tree.type === 'corn' ? 'Cây Ngô ' : 
           'Cây Cà Phê '}
        </h2>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#777'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ margin: '15px 0' }}>
        <div style={{ 
          background: getStatusColor(tree.status), 
          color: '#fff', 
          padding: '8px 12px', 
          borderRadius: '20px',
          display: 'inline-block',
          marginBottom: '12px',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          {getStatusLabel(tree.status)}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px' }}>
          <div style={{ fontWeight: 'bold', color: '#555' }}>ID:</div>
          <div style={{ color: '#000' }}>{tree.id}</div>
          
          <div style={{ fontWeight: 'bold', color: '#555' }}>Tuổi cây:</div>
          <div style={{ color: '#000' }}>{tree.daysPlanted} ngày</div>
          
          <div style={{ fontWeight: 'bold', color: '#555' }}>Năng suất:</div>
          <div style={{ color: '#000' }}>{calculateYield(tree)}%</div>
          
          <div style={{ fontWeight: 'bold', color: '#555' }}>Vị trí:</div>
          <div style={{ color: '#000', fontSize: '0.9rem' }}>[{tree.position?.map((p: number) => Math.round(p * 100) / 100).join(', ')}]</div>
        </div>
      </div>
      
      <div style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginTop: 15
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#333' }}>
          Thông tin NFT
        </h3>
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span>Chủ sở hữu:</span>
            <span style={{ fontWeight: 'bold', color: '#1976D2' }}>
              {tree.owner || 'MyMotherFarm'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span>Giá thuê:</span>
            <span style={{ fontWeight: 'bold', color: '#388E3C' }}>
              {calculatePrice(tree)} USDT/tháng
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Thời hạn:</span>
            <span style={{ fontWeight: 'bold' }}>
              {tree.leasePeriod || '12 tháng'}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button style={{
          flex: 1,
          padding: '10px 0',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Thuê Cây
        </button>
        <button style={{
          flex: 1,
          padding: '10px 0',
          background: '#FFA000',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Chi tiết
        </button>
      </div>
    </div>
  );
};

export default TreeInfoPanel;