import './App.css'
import Dashboard from './assets/Dashboard';
import UploadFile from './assets/Upload'
import {Routes , Route} from "react-router";

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />}></Route>
      </Routes>

    </>
  )
}

export default App
