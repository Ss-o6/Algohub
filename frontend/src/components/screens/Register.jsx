import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { Google as GoogleIcon, GitHub as GitHubIcon } from "@mui/icons-material";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Send OTP
  const handleSendOtp = async () => {
    try {
      const res = await api.post("/generate-otp", { email });
      alert(res.data.message || "OTP sent!");
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    try {
      const res = await api.post("/validate-otp", { email, otp }, { withCredentials: true });
      alert(res.data.message || "Email verified!");
      setOtpVerified(true);
    } catch (err) {
      console.error(err);
      alert("Invalid OTP or expired.");
    }
  };

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpVerified) return alert("Verify email first!");
    try {
      const res = await api.post("/register", {
        fname,
        lname,
        email,
        password,
      });
      alert(res.data.message || "Registration successful!");
      navigate("/homepage");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + (err.response?.data?.message || ""));
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:5000/google";
  };
  const handleGithubRegister = () => {
    window.location.href = "http://localhost:5000/github";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e1d1efff 0%, #b2d0eeff 100%)",
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleRegister}
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
          sx={{ color: "black", fontWeight: "bold" }}
        >
          Register
        </Typography>

        {/* Email & OTP Section */}
        <FormControl fullWidth>
          <FormLabel sx={{ color: "black" }}>Email</FormLabel>
          <TextField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={otpVerified}
          />
        </FormControl>

        {!otpSent ? (
          <Button variant="contained" color="primary" onClick={handleSendOtp}>
            Send OTP
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
            <Button
              variant="contained"
              color="success"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2, color: "black" }}>User Details</Divider>

        {/* Always visible but disabled until OTP verified */}
        <FormControl fullWidth>
          <FormLabel sx={{ color: "black" }}>Firstname</FormLabel>
          <TextField
            type="text"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
            disabled={!otpVerified}
            sx={{ "& .MuiInputBase-root.Mui-disabled": { color: "grey.600" } }}
          />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel sx={{ color: "black" }}>Lastname</FormLabel>
          <TextField
            type="text"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
            disabled={!otpVerified}
            sx={{ "& .MuiInputBase-root.Mui-disabled": { color: "grey.600" } }}
          />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel sx={{ color: "black" }}>Password</FormLabel>
          <TextField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!otpVerified}
            sx={{ "& .MuiInputBase-root.Mui-disabled": { color: "grey.600" } }}
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={!otpVerified}
        >
          Register
        </Button>

        <Divider sx={{ color: "black", my: 1 }}>OR</Divider>

        <Button
          variant="contained"
          color="error"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleRegister}
        >
          Continue with Google
        </Button>

        <Button
          variant="contained"
          sx={{ bgcolor: "black", "&:hover": { bgcolor: "#333" } }}
          startIcon={<GitHubIcon />}
          onClick={handleGithubRegister}
        >
          Continue with GitHub
        </Button>
      </Box>
    </Box>
  );
}
