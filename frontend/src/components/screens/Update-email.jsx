import React, { useEffect, useState } from "react";
import api from "../../api.js";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

const UpdateEmail = () => {
  const [email, setEmail] = useState(""); // current email
  const [newEmail, setNewEmail] = useState(""); // email to update
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current email on mount
  useEffect(() => {
    const fetchCurrentEmail = async () => {
      try {
        const res = await api.get("/me", { withCredentials: true });
        setEmail(res.data.user.email);
      } catch (err) {
        console.error("Failed to fetch email", err);
        setMessage("Failed to load current email");
      }
    };
    fetchCurrentEmail();
  }, []);

  // Update email
  const handleEmailUpdate = async () => {
    if (!newEmail) {
      setMessage("Please enter a new email");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/update-email", { email: newEmail }, { withCredentials: true });
      setMessage(res.data.message || "Email updated successfully");
      setEmail(newEmail); // update current email display
      setNewEmail(""); // clear input
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f9ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          boxShadow: 5,
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "#1565c0", fontWeight: 600, textAlign: "center" }}
          >
            Update Email
          </Typography>

          <Typography sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}>
            <b>Current Email:</b> {email || "Loading..."}
          </Typography>

          <TextField
            fullWidth
            label="Enter New Email"
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#90caf9" },
                "&:hover fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleEmailUpdate}
            disabled={loading}
            sx={{
              bgcolor: "#1976d2",
              ":hover": { bgcolor: "#1565c0" },
              py: 1.2,
              borderRadius: 2,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Update Email"}
          </Button>

          {message && (
            <Typography
              sx={{
                mt: 2,
                textAlign: "center",
                color: message.includes("successfully") ? "green" : "red",
              }}
            >
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UpdateEmail;
