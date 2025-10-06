import React from "react";

import {BrowserRouter, Routes, Route} from "react-router-dom";
//import "react-toastify/dist/ReactToastify.css";
import Login from "./components/screens/Login.jsx";
import Register from "./components/screens/Register.jsx"
import Dashboards from "./components/screens/Dashboards.jsx";
import Homepage from "./components/screens/Homepage.jsx";
import Problempage from "./components/screens/Problempage.jsx";
import Createproblem from "./components/screens/Create-problem.jsx";
import Problemdetails from "./components/screens/Problem-details.jsx";
const App=()=>{
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<Dashboards/>}/>
       <Route path="/login" element={<Login/>}/>
       <Route path="/register" element={<Register/>}/>
       <Route path="/homepage" element={<Homepage/>}/>
       <Route path="/problems" element={<Problempage/>}/>
       <Route path="/create-problem" element={<Createproblem/>}/>
       <Route path="/problem/:id" element={<Problemdetails/>}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App;
