import './App.css'
import UploadFile from './assets/Upload'
import {Routes , Route} from "react-router";

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<UploadFile />}></Route>
      </Routes>

    </>
  )
}

export default App
