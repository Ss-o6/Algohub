import React from "react";

import {BrowserRouter, Routes, Route} from "react-router-dom";
//import "react-toastify/dist/ReactToastify.css";
import Login from "./components/screens/login.jsx";
import Register from "./components/screens/register.jsx"
import Dashboards from "./components/screens/Dashboards.jsx";
import Homepage from "./components/screens/Homepage.jsx";
const App=()=>{
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<Dashboards/>}/>
       <Route path="/login" element={<Login/>}/>
       <Route path="/register" element={<Register/>}/>
       <Route path="/homepage" element={<Homepage/>}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App;
