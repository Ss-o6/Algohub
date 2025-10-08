import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { AddCircle, Delete } from "@mui/icons-material";
import Navbar from "../screens/Navbar.jsx";
import api from "../../api.js";

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [testcases, setTestcases] = useState([{ input: "", output: "" }]);

  // Fetch current problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`, { withCredentials: true });
        const problem = res.data.PROBLEM;

        setTitle(problem.title || "");
        setDescription(problem.description || "");
        setInputFormat(problem.inputformat || "");
        setOutputFormat(problem.outputformat || "");
        setConstraints(problem.constraints || "");
        setDifficulty(problem.difficulty || "easy");
        setTestcases(problem.testcases.length ? problem.testcases : [{ input: "", output: "" }]);
      } catch (err) {
        console.error("Failed to fetch problem:", err);
        alert("Failed to fetch problem data");
        navigate("/problems");
      }
    };

    fetchProblem();
  }, [id, navigate]);

  // Testcase handlers
  const handleChangeTestcase = (index, field, value) => {
    const updated = [...testcases];
    updated[index][field] = value;
    setTestcases(updated);
  };

  const handleAddTestcase = () => setTestcases([...testcases, { input: "", output: "" }]);
  const handleRemoveTestcase = (index) => {
    const updated = testcases.filter((_, i) => i !== index);
    setTestcases(updated.length ? updated : [{ input: "", output: "" }]);
  };

  // Submit updated problem
  const handleSubmit = async () => {
    try {
      await api.put(
        `/editproblem/${id}`,
        {
          title,
          description,
          inputformat: inputFormat,
          outputformat: outputFormat,
          constraints,
          difficulty,
          testcases,
        },
        { withCredentials: true }
      );
      alert("Problem updated successfully ✅");
      navigate("/problems");
    } catch (err) {
      console.error("Failed to update problem:", err);
      alert("Failed to update problem ❌");
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Card sx={{ p: 4, borderRadius: "16px", boxShadow: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Edit Problem
          </Typography>

          <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Input Format"
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Output Format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            margin="normal"
          />

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

          <Button startIcon={<AddCircle />} onClick={handleAddTestcase} sx={{ mt: 2 }} variant="outlined" color="primary">
            Add Testcase
          </Button>

          <FormControl fullWidth margin="normal" sx={{ mt: 3 }}>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Update Problem
            </Button>
          </Box>
        </Card>
      </Box>
    </>
  );
};

export default EditProblem;
