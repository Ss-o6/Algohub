import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Button,
  Divider,
  Link,
} from "@mui/material";
import { Google as GoogleIcon, GitHub as GitHubIcon } from "@mui/icons-material";

import api from "../../api.js";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
        const res= await api.post("/login",{email,password},{withCredentials:true});
        
        window.location.href="/homepage";
    } catch (error) {
        alert(error.response?.data?.message ||"Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:5000/github";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #d9d3dfff 0%, #e7ecf2ff 100%)",
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          p: 5,
          borderRadius: 5,
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
          width: "100%",
          maxWidth: 450,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ color: "black", fontWeight: "bold", mb: 2 }}
        >
          Login
        </Typography>

        <FormControl fullWidth>
          <FormLabel sx={{ color: "black" }}>Email</FormLabel>
          <TextField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              input: { color: "black" },
             // "& .MuiOutlinedInput-root": {
               // "& fieldset": { borderColor: "white" },
             // },
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel sx={{ color: "black" }}>Password</FormLabel>
          <TextField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              input: { color: "black" },
              //"& .MuiOutlinedInput-root": {
              //  "& fieldset": { borderColor: "white" },
             // },
            }}
          />
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/forgot-password" underline="hover" sx={{ color: "black", fontSize: 14 }}>
            Forgot Password?
          </Link>
        </Box>

        <Button
          type="submit"
          sx={{
            bgcolor: "#6a11cb",
            backgroundImage: "linear-gradient(315deg, #6a11cb 0%, #2575fc 74%)",
            "&:hover": {
              backgroundImage: "linear-gradient(315deg, #2575fc 0%, #6a11cb 74%)",
            },
            borderRadius: 3,
            py: 1.2,
            color: "white",
          }}
        >
          Login
        </Button>

        <Divider sx={{ color: "black", my: 2 }}>OR</Divider>

        <Button
          variant="contained"
          color="error"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ borderRadius: 3, py: 1.2 }}
        >
          Continue with Google
        </Button>

        <Button
          variant="contained"
          startIcon={<GitHubIcon />}
          onClick={handleGithubLogin}
          sx={{ bgcolor: "black", "&:hover": { bgcolor: "#333" }, borderRadius: 3, py: 1.2 }}
        >
          Continue with GitHub
        </Button>
      </Box>
    </Box>
  );
}
