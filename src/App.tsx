import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Workflow from './components/CreateWorkflow'
import './App.css'
import SheetDemo from'./components/TriggerSheet'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
       <Workflow/>
       <SheetDemo/>
    </div>
  )
}

export default App
