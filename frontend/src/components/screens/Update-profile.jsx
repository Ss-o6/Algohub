import React, { useEffect, useState } from "react";
import api from "../../api.js";
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress } from "@mui/material";

const UpdateProfile = () => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get("/me", { withCredentials: true });
        setFname(res.data.user.fname || "");
        setLname(res.data.user.lname || "");
      } catch (error) {
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async () => {
    if (!fname || !lname) return setMessage("Please fill in both fields");
    try {
      setLoading(true);
      const res = await api.put("/update-profile", { fname, lname }, { withCredentials: true });
      setMessage(res.data.message || "Profile updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f9ff", display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 5, borderRadius: 3, bgcolor: "white" }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, color: "#1565c0", fontWeight: 600, textAlign: "center" }}>
            Update Profile
          </Typography>
          <TextField
            fullWidth
            label="First Name"
            variant="outlined"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#90caf9" }, "&:hover fieldset": { borderColor: "#1976d2" } } }}
          />
          <TextField
            fullWidth
            label="Last Name"
            variant="outlined"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#90caf9" }, "&:hover fieldset": { borderColor: "#1976d2" } } }}
          />
          <Button fullWidth variant="contained" onClick={handleProfileUpdate} disabled={loading} sx={{ bgcolor: "#1976d2", ":hover": { bgcolor: "#1565c0" }, py: 1.2, borderRadius: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
          </Button>
          {message && <Typography sx={{ mt: 2, textAlign: "center", color: message.includes("successfully") ? "green" : "red" }}>{message}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UpdateProfile;
