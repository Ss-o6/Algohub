import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../screens/Navbar.jsx";
import api from "../../api.js";

const Problempage = () => {
  const [problems, setProblems] = useState([]);
  const [filterProblems, setFilterProblems] = useState([]);
  const [showSolved, setShowSolved] = useState(false);
  const [difficulty, setDifficulty] = useState("all");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch problems from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/problems", { withCredentials: true });
        setProblems(res.data.problems);
        setFilterProblems(res.data.problems);
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching problems", error);
        navigate("/homepage");
      }
    };
    fetchData();
  }, [navigate]);

  // Filter problems based on difficulty and solved status
  useEffect(() => {
    let filtered = problems;
    if (showSolved) filtered = filtered.filter((p) => p.solved === true);
    if (difficulty !== "all") filtered = filtered.filter((p) => p.difficulty === difficulty);
    setFilterProblems(filtered);
  }, [showSolved, difficulty, problems]);

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Card sx={{ p: 3, borderRadius: "16px", boxShadow: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Problems
            </Typography>

            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox checked={showSolved} onChange={(e) => setShowSolved(e.target.checked)} />
                <Typography variant="body2">My Submissions</Typography>
              </Box>

              <FormControl size="small">
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Difficulty</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterProblems.map((problem, index) => (
                <TableRow
                  key={problem._id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/problems/${problem._id}`)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{problem.title}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        color:
                          problem.difficulty === "easy"
                            ? "green"
                            : problem.difficulty === "medium"
                            ? "orange"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {problem.solved && <span style={{ color: "green", fontWeight: "bold" }}>Solved</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {user?.role === "admin" && (
            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button variant="contained" color="primary" onClick={() => navigate("/create-problem")}>
                Create Problem
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </>
  );
};

export default Problempage;
