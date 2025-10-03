import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import Navbar from "../screens/Navbar";
import api from "../../api.js";
const Homepage = () => {
  const navigate = useNavigate();
  const [user,setuser]=useState(null);
  const [isAdmin , setisAdmin]=useState(false);
  const [problems, setproblems]=useState([]);
  const [contests, setcontests]=useState([]);



  useEffect(()=>{
    const fetchuserdata= async()=>{
      try {
        const res= await api.get("/me",{withCredentials:true});
        setuser(res.data.user);
        setisAdmin(res.data.user.role=== "admin");
        setproblems(res.data.problems);
        setcontests(res.data.contests);
      } catch (error) {
        console.error("Error fetchind user data",error);
        navigate("/login");
        
      }
    };
    fetchuserdata();
  },[navigate]);
  if(!user){
    return <div className="text-center text-lg">Loading....</div>;
  }


  return (
    <>
       <Navbar/>
     <Box sx={{ p: 4,display: "flex", justifyContent: "center" }}>
  <Card
    sx={{
      p: 4,
      borderRadius: "16px",
      boxShadow: 3,
      textAlign: "center",
      width: "100%",
      
    }}
  >
    {/* Welcome Info */}
    <Typography variant="body1" color="text.secondary" gutterBottom>
      Welcome
    </Typography>
    <Typography variant="h4" fontWeight="bold" gutterBottom>
      {user.fname} {user.lname}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Email: {user.email}
    </Typography>
    <Typography variant="body1" color="text.secondary" gutterBottom>
      Role: {user.role}
    </Typography>

    {/* Problems and Contests */}
    <Typography variant="body1" sx={{ mt: 3 }}>
      Problems Solved: <strong>{problems.length}</strong>
    </Typography>
    <Typography variant="body1" sx={{ mt: 1 }}>
      Contests Participated: <strong>{contests.length}</strong>
    </Typography>
  </Card>
</Box>


      <Box
  sx={{
    p: 4,
    display: "flex",
    justifyContent: "center", // center horizontally
    alignItems: "center",
    flexDirection: "column",
    gap: 4, // space between welcome card and this grid
  }}
>
  <Grid
    container
    spacing={3}
    sx={{ maxWidth: "900px", margin: "0 auto" }} // container width and center
  >
    {/* Problems Card */}
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          p: 4,
          borderRadius: "20px",
          boxShadow: 5,
          textAlign: "center",
          cursor: "pointer",
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          color: "#fff",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 10,
          },
        }}
        onClick={() => navigate("/problems")}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Problems
        </Typography>
        
      </Card>
    </Grid>

    {/* Contests Card */}
    <Grid item xs={12} md={6}>
      <Card
        sx={{ p: 4,
          borderRadius: "20px",
          boxShadow: 5,
          textAlign: "center",
          cursor: "pointer",
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          color: "#fff",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 10,
          
          },
        }}
        onClick={() => navigate("/contests")}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Contests
        </Typography>
        
      </Card>
    </Grid>
  </Grid>
</Box>


      </>
  )};
  export default Homepage;