import './App.css'
import FarmScene from './scenes/FarmScene'
import FarmUI from './scenes/FarmUI'

function App() {
  return (
    <div className="App">
      <FarmUI>
        <FarmScene />
      </FarmUI>
    </div>
  )
}

export default App
