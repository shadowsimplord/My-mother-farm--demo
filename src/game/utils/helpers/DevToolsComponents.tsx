import { ENABLE_DEV_TOOLS } from '../../../App';
import CoordinateAxes from '../../../devtools/CoordinateAxes';
import OriginPoint from '../../../devtools/OriginPoint';
import GridHelper from '../../../devtools/GridHelper';
import WireframeManager from '../../../devtools/WireframeManager';

/**
 * Container chứa tất cả các helpers liên quan đến DevTools
 * Chỉ render nếu ENABLE_DEV_TOOLS=true
 */
export default function DevToolsComponents() {
  // Không render nếu DevTools bị tắt
  if (!ENABLE_DEV_TOOLS) return null;
  
  return (
    <>
      <CoordinateAxes size={50} visible={false} />
      <OriginPoint size={0.3} visible={false} />
      <GridHelper size={50} divisions={50} />
      <WireframeManager />
    </>
  );
}