import React from "react";
import {Box, AppBar, Button, Container, Typography, Toolbar} from "@mui/material";
export default function Dashboards(){
    return(
        <Box sx={{minHeight:"100vh",width:"100%",bgcolor:"#f5f5f5"}}>
            <AppBar position="static" color="transparent" elevation={0}>
              <Toolbar sx={{justifyContent:"flex-end", gap:2}}>
                <Button variant="contained" color="primary" href="/login">
                 Login</Button>
                 <Button variant="contained" color="primary" href="/register">
                 Register</Button>
              </Toolbar>
            </AppBar>
            <Container 
            maxWidth={false}
            sx={{
                  display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          textAlign: "center",
            }

            }>
        <Typography variant="h1" sx={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: "bold", mb: 2 }}>
          AlgoHub
        </Typography>

       
        <Typography variant="h5" sx={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "text.secondary" }}>
         Master algorithms with ease
        </Typography>

            </Container>
        </Box>
    );
}