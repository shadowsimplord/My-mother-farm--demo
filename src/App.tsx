import './App.css'
import WorldScene from './scenes/WorldScene'
import FarmUI from './scenes/FarmUI'
import LoadingScreen from './components/ui/LoadingScreen'
import { useState } from 'react'
import DevTools from './devtools/DevTools'

// Để tắt DevTools hoàn toàn, đặt thành false
export const ENABLE_DEV_TOOLS = true;

function App() {
  // Chỉ tạo state khi DevTools được bật
  const [devToolsVisible, setDevToolsVisible] = useState(ENABLE_DEV_TOOLS);

  return (
    <div className="App">
      {/* DevTools chỉ được render khi ENABLE_DEV_TOOLS = true */}
      {ENABLE_DEV_TOOLS && (
        <DevTools visible={devToolsVisible} setVisible={setDevToolsVisible} />
      )}
      
      <LoadingScreen>
        <FarmUI>
          <WorldScene />
        </FarmUI>
      </LoadingScreen>
    </div>
  )
}

export default App
