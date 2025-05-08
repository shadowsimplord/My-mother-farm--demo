import './App.css'
import LoadingScreen from './components/ui/LoadingScreen'
import { useState } from 'react'
import DevTools from './devtools/DevTools'
import { SceneRenderer } from './game/managers/SceneManager'

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
      
      {/* Loading screen for initial app load */}
      <LoadingScreen>
        <SceneRenderer />
      </LoadingScreen>
    </div>
  )
}

export default App
