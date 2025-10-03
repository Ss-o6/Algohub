import React, {useEffect, useState} from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  
} from "@mui/material";

import {useNavigate} from "react-router-dom";
import Navbar from "../screens/Navbar.jsx"
import api from "../../api.js";


const createproblem=()=>{
    const [title,settitle]=useState("");
    const [description,setdescription]=useState("");
     const [inputformat,setinputformat]=useState("");
      const [outputformat,setoutputformat]=useState("");
       const [constraints,setconstraints]=useState("");
        const [sampleinput,setsampleinput]=useState("");
         const [sampleoutput,setsampleoutput]=useState("");
          const [difficulty,setdifficulty]=useState("");
          //const [testcases, settestcases] = useState([{ input: "", output: "" }]);

          const navigate= useNavigate();

    const handlesubmit =async()=>{
        try {
            const res= await api.post("/addproblems",{
                title,
                description,
                inputformat,
                outputformat,
                constraints,
                sampleinput,
                sampleoutput,
                difficulty,
                testcases: [{ input: sampleinput, output: sampleoutput }]
            },{withCredentials:true});
            alert("Problem added successfully");
        } catch (error) {
            console.log("Error creating problem", error);
            alert("Failed to add problem");
        }
    };
    return (
        <>
        <Navbar/>
        <Box sx={{p:4}}>
            <Card sx={{p:4, borderRadius:"16px", boxShadow:3}}>
                <Typography variant="h6" fontWeight="bold" mb={3}>Create new problem</Typography>
                
                 <TextField fullWidth  label="Title" value={title} onChange={e=>settitle(e.target.value)} margin="normal"/>

                <TextField fullWidth multiline rows={4} label="Description" value={description} onChange={e=>setdescription(e.target.value)} margin="normal"/>
                 <TextField fullWidth multiline rows={4} label="Input Format" value={inputformat} onChange={e=>setinputformat(e.target.value)} margin="normal"/>
                 <TextField fullWidth multiline rows={4} label="Output Format" value={outputformat} onChange={e=>setoutputformat(e.target.value)} margin="normal"/>
                 <TextField fullWidth label="Constraints" value={constraints} onChange={e=>setconstraints(e.target.value)} margin="normal"/>
                 <TextField fullWidth label="Sample Input" value={sampleinput} onChange={e=>setsampleinput(e.target.value)} margin="normal"/>
                 <TextField fullWidth label="Sample Output" value={sampleoutput} onChange={e=>setsampleoutput(e.target.value)} margin="normal"/>
                 <FormControl fullwidth margin="normal">
                    <Select value={difficulty} onChange={e=>setdifficulty(e.target.value)}>
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>Difficulty
                    </Select>
                 </FormControl>
                   <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button variant="contained" color="primary" onClick={handlesubmit}>
              Create Problem
            </Button>
          </Box>
                
            </Card>
        </Box>
        </>
    )
    
};
export default createproblem;