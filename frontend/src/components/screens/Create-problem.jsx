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
import IconButton from "@mui/material/IconButton";

import { AddCircle, Delete } from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import Navbar from "../screens/Navbar.jsx"
import api from "../../api.js";


const createproblem=()=>{
    const [title,settitle]=useState("");
    const [description,setdescription]=useState("");
     const [inputformat,setinputformat]=useState("");
      const [outputformat,setoutputformat]=useState("");
       const [constraints,setconstraints]=useState("");
       
          const [difficulty,setdifficulty]=useState("");
          const [testcases, setTestcases] = useState([{ input: "", output: "" }]);

          const navigate= useNavigate();

      const handleAddTestcase = () => {
      setTestcases([...testcases, { input: "", output: "" }]);
      };

        // handle removing a testcase
      const handleRemoveTestcase = (index) => {
       setTestcases(testcases.filter((_, i) => i !== index));
       };
        const handleChangeTestcase = (index, field, value) => {
           const newTestcases = [...testcases];
            newTestcases[index][field] = value;
             setTestcases(newTestcases);
            };

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
                testcases,
            },{withCredentials:true});
            alert("Problem added successfully");
            navigate("/problems");
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
             
             <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Testcases
          </Typography>
          {testcases.map((tc, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label={`Input ${index + 1}`}
                value={tc.input}
                onChange={(e) => handleChangeTestcase(index, "input", e.target.value)}
              />
              <TextField
                fullWidth
                label={`Output ${index + 1}`}
                value={tc.output}
                onChange={(e) => handleChangeTestcase(index, "output", e.target.value)}
              />
              {testcases.length > 1 && (
                <IconButton color="error" onClick={() => handleRemoveTestcase(index)}>
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<AddCircle />}
            onClick={handleAddTestcase}
            sx={{ mt: 2 }}
            variant="outlined"
            color="primary"
          >
            Add Testcase
          </Button>
          <FormControl fullWidth margin="normal" sx={{ mt: 3 }}>
  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
    Difficulty
  </Typography>
  <Select
    value={difficulty}
    onChange={(e) => setdifficulty(e.target.value)}
    displayEmpty
  >
    <MenuItem value="">Select Difficulty</MenuItem>
    <MenuItem value="easy">Easy</MenuItem>
    <MenuItem value="medium">Medium</MenuItem>
    <MenuItem value="hard">Hard</MenuItem>
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