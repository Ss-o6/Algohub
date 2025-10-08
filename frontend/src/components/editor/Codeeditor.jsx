import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Box, FormControl, InputLabel, Select, MenuItem, Button, TextField, Grid } from "@mui/material";
import Editor from "@monaco-editor/react";

const defaultCode = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\ncout<<"Hello, World!";\n return 0;\n}`,
  c: `#include <stdio.h>\nint main(){\n printf("Hello, World!");\n return 0;\n}`,
  python:`print("Hello, World!")`,
  javascript: `console.log("Hello, World!");`,
  java: `import java.util.*;\npublic class Main{\npublic static void main(String[] args){\nSystem.out.println("Hello, World!");\n}\n}`
};

const CodeEditor = () => {
  const { id: problemId } = useParams();
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(defaultCode.cpp);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [problem, setProblem] = useState(null);
  const [runningRun, setRunningRun] = useState(false);
  const [runningSubmit, setRunningSubmit] = useState(false);

  useEffect(() => setCode(defaultCode[language]), [language]);

  // Fetch problem and first testcase
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://localhost:5000/problems/${problemId}`, { credentials: "include" });
        const data = await res.json();
        if (data.PROBLEM) {
          setProblem(data.PROBLEM);
          if (data.PROBLEM.testcases && data.PROBLEM.testcases.length > 0) {
            setInput(data.PROBLEM.testcases[0].input);
          }
        } else {
          setError("Problem not found");
        }
      } catch (err) {
        setError(err.message || JSON.stringify(err));
      }
    };
    if (problemId) fetchProblem();
  }, [problemId]);

  // ===== RUN CODE =====
  const handleRun = async () => {
    setRunningRun(true);
    setError("");
    setOutput("");
    setVerdict(null);

    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, input }),
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        // Show full compiler/runtime error
        setError(data.stderr || "Execution failed");
        setOutput(data.stdout || "");
        return;
      }

      setOutput(data.stdout || "");
      setError(data.stderr || "");
    } catch (err) {
      setError(err.message || "Something went wrong while running");
    } finally {
      setRunningRun(false);
    }
  };

  // ===== SUBMIT CODE =====
  const handleSubmit = async () => {
    setRunningSubmit(true);
    setError("");
    setVerdict(null);

    try {
      const res = await fetch(`http://localhost:5000/submit/${problemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Submission failed");
        return;
      }

      setVerdict(data); // verdict only, no full errors
    } catch (err) {
      setError(err.message || "Something went wrong while submitting");
    } finally {
      setRunningSubmit(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Language">
            {Object.keys(defaultCode).map((lang) => (
              <MenuItem key={lang} value={lang}>{lang.toUpperCase()}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Editor height="400px" language={language} value={code} onChange={setCode} theme="vs-dark" />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField label="Input" multiline rows={4} fullWidth value={input} onChange={(e) => setInput(e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Output" multiline rows={4} fullWidth value={output} InputProps={{ readOnly: true }} />
        </Grid>
        {error && (
  <Box
    sx={{
      mt: 2,
      p: 2,
      border: "1px solid red",
      borderRadius: 1,
      backgroundColor: "#ffebee",
      width: "100%",
      whiteSpace: "pre-wrap", // preserves line breaks and wraps long lines
      fontFamily: "monospace",
    }}
  >
    <strong>Error:</strong>
    <div>{error}</div>
  </Box>
)}

                


      </Grid>

      {verdict && verdict.testcaseResults && (
        <Box sx={{ mt: 2, p: 2, border: "1px solid", borderColor: verdict.status === "Success" ? "green" : "red", borderRadius: 1, backgroundColor: verdict.status === "Success" ? "#e8f5e9" : "#ffebee" }}>
          <strong>Verdict:</strong> {verdict.status === "Success" ? "All Testcases Passed ✅" : `Failed (${verdict.passed}/${verdict.total}) ❌`}
          <Box sx={{ mt: 1 }}>
            {verdict.testcaseResults.map((t) => (
              <Box key={t.testcase} sx={{ mb: 1 }}>
                Testcase {t.testcase}: <strong>{t.result}</strong><br />
                {t.expectedOutput && <>Expected: {t.expectedOutput}<br /></>}
                {t.actualOutput && <>Output: {t.actualOutput}<br /></>}
                {t.error && <span style={{ color: "red" }}>Error: {t.error}</span>}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          onClick={handleRun}
          disabled={runningRun}
          sx={{
            mr: 2,
            backgroundColor: runningRun ? "#90caf9" : "#1976d2",
            color: "#fff",
            "&:hover": { backgroundColor: runningRun ? "#90caf9" : "#1565c0" },
          }}
        >
          Run
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={runningSubmit}
          sx={{
            backgroundColor: runningSubmit ? "#a5d6a7" : "#388e3c",
            color: "#fff",
            "&:hover": { backgroundColor: runningSubmit ? "#a5d6a7" : "#2e7d32" },
          }}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default CodeEditor;
