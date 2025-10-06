import React ,{useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import{
    Box,Grid,Card,Typography,Button, Chip, CircularProgress
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../api.js";
import Navbar from "../screens/Navbar.jsx";
import Codeeditor from "../editor/Codeeditor.jsx";
const problemdetails=()=>{
       const {id}=useParams();
       const navigate=useNavigate();
       const [problem, setproblem]=useState(null);
       const [loading , setloading]=useState(true);
       
       const [isSolved, setisSolved]= useState(false);

    useEffect(()=>{
        const fetchProblem=async()=>{
            try {
                const res=await api.get(`problesm/${id}`,{withCredentials:true});
                setproblem( res.data.problem);
                const solvedres=await api.get(`problems/{id}/issolved`,{
                    withCredentials:true,
                });
            } catch (error) {
              console.error("Error fetching problem", error);
              navigate("/problems");   
            }finally{
                setloading(false);
            }
        };
        fetchProblem();

    },[id,navigate]);
    if(loading) return <CircularProgress/>;
    if(!problem) return <Typography>Sorry something went wrong!!</Typography>
    return(
        <>
        <Navbar/>
        <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,p:3}}>
            <Card sx={{p:3}}>
                <Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <Typography variant="h5" fontWeight="bold">{problem.title}</Typography>
                    <Typography variant="body2" sx={{color: problem.difficulty==="easy"? "green":
                                                            problem.difficulty==="medium"?"orange":"red",
                                                            fontWeight:"bold"
                    }}>{problem.difficulty}</Typography>
                    {solved && (
                        <Chip
                          icon={<CheckCircleIcon sx={{color:"green"}}/>}
                          label="Solved"
                          sx={{
                            
                            color:"green",
                            fontWeight:"bold",
                          }}
                          />
                        )}
                    
                </Box>
                <Box sx={{mt:3, display:"flex", gap:2}}>
                    <Button variant="outlined" color="success" onClick={()=> navigate(`/problems/${id}/all-submission`)}>All Submissions</Button>
                    <Button variant="outlined" color="error" onClick={()=> navigate(`/problems/${id}/my-submission`)}>My Submissions</Button>
                </Box>
                <Typography variant="body1" sx={{mt:2}}>{problem.description}</Typography>
                <Typography variant="subtitle2" sx={{mt:2}}>Input Format</Typography>
                <Typography variant="body2">{problem.inputformat}</Typography>
                 <Typography variant="subtitle2" sx={{mt:2}}>Output Format</Typography>
                <Typography variant="body2">{problem.outputformat}</Typography>
                 <Typography variant="subtitle2" sx={{mt:2}}>Constraints</Typography>
                <Typography variant="body2">{problem.constraints}</Typography>


            </Card>
            <Card sx={{p:2,height:"80vh"}}>
                <Codeeditor/>
            </Card>
        </Box>
        </>
    )
}
export default problemdetails;