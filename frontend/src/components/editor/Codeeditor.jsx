import React, { useState, useEffect } from "react";
import { Container, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import Editor from "@monaco-editor/react";

const defaultCode = {
  cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  python: `print("Hello, World!")`,
  javascript: `console.log("Hello, World!");`,
};

const CodeEditor = () => {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(defaultCode["cpp"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  // Reset code when language changes
  useEffect(() => {
    setCode(defaultCode[language]);
  }, [language]);

  const handleRun = async () => {
    setRunning(true);
    setError("");
    setVerdict("");
    setOutput("");
    try {
      // Replace with your API call
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",

        body: JSON.stringify({ code, language, input }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setOutput(data.output);
    } catch (err) {
      setError("Something went wrong while running the code.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    setError("");
    setVerdict("");
    try {
      // Replace with your API call
      const res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setVerdict(data.message || "Submitted!");
    } catch (err) {
      setError("Something went wrong while submitting the code.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      {/* Top row: Language select + Run */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Language">
            {Object.keys(defaultCode).map((lang) => (
              <MenuItem key={lang} value={lang}>{lang.toUpperCase()}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleRun} disabled={running} color="primary" size="small">
          Run
        </Button>
      </Box>

      {/* Code Editor */}
      <Editor
        height="60vh"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
      />

      {/* Input / Output side by side */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid sx={{ flex: 1 }}>
          <TextField
            label="Input"
            multiline
            rows={4}
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Grid>
        <Grid sx={{ flex: 1 }}>
          <TextField
            label="Output"
            multiline
            rows={4}
            fullWidth
            size="small"
            value={output}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>

      {/* Verdict / Error */}
      {verdict && (
        <TextField
          label="Verdict"
          multiline
          rows={2}
          fullWidth
          value={verdict}
          sx={{ mt: 2 }}
          size="small"
          InputProps={{ readOnly: true }}
        />
      )}
      {error && (
        <TextField
          label="Error"
          multiline
          rows={3}
          fullWidth
          value={error}
          sx={{ mt: 2, borderColor: "red" }}
          size="small"
          InputProps={{ readOnly: true }}
        />
      )}

      {/* Bottom row: Submit button */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={handleSubmit} disabled={running} color="success" size="small">
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default CodeEditor;
