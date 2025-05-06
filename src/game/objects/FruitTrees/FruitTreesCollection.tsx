import React, { useCallback, useMemo } from 'react';
import { CoffeeTrees } from './CoffeeTree';
import { CherryTrees } from './CherryTree';
import { CornPlants } from './CornPlant';
import fruitTreesData from '../../systems/data/FruitTreesdata.json';
import { TreeInfo } from '../../types';

const FruitTreesCollection = () => {
  // Tối ưu: memoize các hàm callback
  const handleTreeClick = useCallback((info: TreeInfo) => {
    console.log(`Tree clicked: ${info.type} at [${info.position.join(', ')}]`);
    
    // Xử lý hiển thị thông tin cây - chỉ cập nhật UI, không can thiệp camera
    if (window.farmUI?.setSelectedTree) {
      window.farmUI.setSelectedTree(info);
    }
    // Đã loại bỏ phần điều khiển camera ở đây để tránh xung đột với tương tác người dùng
  }, []);
  
  const handleTreeHover = useCallback((info: TreeInfo, isHovering: boolean) => {
    if (window.farmUI?.setHoverTreePosition) {
      window.farmUI.setHoverTreePosition(isHovering ? info.position : null);
    }
  }, []);
  
  // Tối ưu: memoize các dữ liệu cây để tránh tính toán lại khi re-render
  const coffeeTrees = useMemo(() => fruitTreesData
    .filter(tree => tree.type === 'coffee-tree')
    .map((tree, index) => ({
      ...tree,
      id: tree.id || `coffee-${index}-${Date.now()}`, 
      position: tree.position as [number, number, number]
    })), []);
  
  const cherryTrees = useMemo(() => fruitTreesData
    .filter(tree => tree.type === 'cherry')
    .map((tree, index) => ({
      ...tree,
      id: tree.id || `cherry-${index}-${Date.now()}`, 
      position: tree.position as [number, number, number]
    })), []);
  
  const cornPlants = useMemo(() => fruitTreesData
    .filter(tree => tree.type === 'corn')
    .map((tree, index) => ({
      ...tree,
      id: tree.id || `corn-${index}-${Date.now()}`,
      position: tree.position as [number, number, number]
    })), []);
  
  return (
    <>
      <CoffeeTrees 
        trees={coffeeTrees}
        onTreeClick={handleTreeClick}
        onTreeHover={handleTreeHover}
      />
      
      <CherryTrees 
        trees={cherryTrees}
        onTreeClick={handleTreeClick}
        onTreeHover={handleTreeHover}
      />
      
      <CornPlants
        plants={cornPlants}
        onPlantClick={handleTreeClick}
        onPlantHover={handleTreeHover}
      />
    </>
  );
};

// Tối ưu: Bọc bằng React.memo để tránh re-render khi props không thay đổi
export default React.memo(FruitTreesCollection);