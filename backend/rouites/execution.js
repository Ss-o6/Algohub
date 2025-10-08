import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import { v4 as uuid } from "uuid";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { authenticate } from "../middleware/requireauth.js";
import Problems from "../models/problems.js";
import User from "../models/users.js";


const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const dirFiles = path.join(__dirname, "..", "programfiles");
const dirCodes = path.join(dirFiles, "codes");
const dirInputs = path.join(dirFiles, "inputs");

fs.mkdirSync(dirCodes, { recursive: true });
fs.mkdirSync(dirInputs, { recursive: true });

// Generate code file
const generateFile = (language, code) => {
  const ext = language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase() === "js" ? "js" : language.toLowerCase();
  const filePath = path.join(dirCodes, `${uuid()}.${ext}`);
  fs.writeFileSync(filePath, code);
  return filePath;
};

// Generate input file
const generateInputFile = (filePath, input) => {
  const inputPath = path.join(dirInputs, `${path.basename(filePath)}_input.txt`);
  fs.writeFileSync(inputPath, input.endsWith("\n") ? input : input + "\n");
  return inputPath;
};

// Execute code (returns stdout/stderr fully)
const executeCode = (filePath, language, inputPath, timeLimit = 5) => {
  return new Promise((resolve, reject) => {
    let cmd, args, compileOut;

    const runCode = (run) => {
      let stdout = "", stderr = "";
      const timeout = setTimeout(() => {
        run.kill("SIGTERM");
        reject({ stdout, stderr: `Time limit exceeded (${timeLimit}s)` });
      }, timeLimit * 1000);

      run.stdout.on("data", (data) => stdout += data.toString());
      run.stderr.on("data", (data) => stderr += data.toString());

      if (inputPath && fs.existsSync(inputPath)) {
        run.stdin.write(fs.readFileSync(inputPath, "utf-8"), () => run.stdin.end());
      } else run.stdin.end();

      run.on("close", () => {
        clearTimeout(timeout);
        resolve({ stdout, stderr });
      });

      run.on("error", (err) => {
        clearTimeout(timeout);
        reject({ stdout: "", stderr: err.message });
      });
    };

    switch (language.toLowerCase()) {
      case "cpp":
        compileOut = filePath.replace(".cpp", ".out");
        cmd = "g++";
        args = [filePath, "-o", compileOut];
        const cppCompile = spawn(cmd, args);
        let compileErr = "";
        cppCompile.stderr.on("data", (data) => compileErr += data.toString());
        cppCompile.on("close", (code) => {
          if (code !== 0) return reject({ stdout: "", stderr: compileErr });
          runCode(spawn(compileOut));
        });
        return;

      case "c":
        compileOut = filePath.replace(".c", ".out");
        cmd = "gcc";
        args = [filePath, "-o", compileOut];
        const cCompile = spawn(cmd, args);
        compileErr = "";
        cCompile.stderr.on("data", (data) => compileErr += data.toString());
        cCompile.on("close", (code) => {
          if (code !== 0) return reject({ stdout: "", stderr: compileErr });
          runCode(spawn(compileOut));
        });
        return;

      case "java":
        cmd = "javac";
        args = [filePath];
        const javaCompile = spawn(cmd, args);
        compileErr = "";
        javaCompile.stderr.on("data", (data) => compileErr += data.toString());
        javaCompile.on("close", (code) => {
          if (code !== 0) return reject({ stdout: "", stderr: compileErr });
          const className = path.basename(filePath, ".java");
          runCode(spawn("java", ["-cp", path.dirname(filePath), className]));
        });
        return;

      case "python":
        runCode(spawn("python3", [filePath]));
        return;

      case "javascript":
      case "js":
        runCode(spawn("node", [filePath]));
        return;

      default:
        return reject({ stdout: "", stderr: "Unsupported language" });
    }
  });
};

// ===== RUN endpoint =====
router.post("/run", authenticate, async (req, res) => {
  const { language, code, input } = req.body;
  if (!language || !code) return res.status(400).json({ success: false, stdout: "", stderr: "Code and language required" });

  let filePath, inputPath;
  try {
    filePath = generateFile(language, code);
    if (input) inputPath = generateInputFile(filePath, input);

    const result = await executeCode(filePath, language, inputPath);

    res.json({
      success: true,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      message: result.stderr ? "Execution error" : "Executed successfully"
    });
  } catch (err) {
    res.status(200).json({  // 200 to show full stderr in frontend
      success: false,
      stdout: err.stdout || "",
      stderr: err.stderr || err.message || "Execution failed",
      message: "Execution failed"
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  }
});

// ===== SUBMIT endpoint =====
router.post("/submit/:id", authenticate, async (req, res) => {
  const { language, code } = req.body;
  const problemId = req.params.id;
  const userId = req.user.id;
  const username = `${req.user.fname} ${req.user.lname}`;

  try {
    const problem = await Problems.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, error: "Problem not found" });
    if (!language || !code) return res.status(400).json({ success: false, error: "Code and language required" });

    const filePath = generateFile(language, code);
    const testCases = problem.testcases;
    let passedCount = 0;
    const testcaseResults = [];

    for (let i = 0; i < testCases.length; i++) {
      const inputPath = generateInputFile(filePath, testCases[i].input);
      let resultObj = { stdout: "", stderr: "" };
      let status = "Passed";

      try {
        resultObj = await executeCode(filePath, language, inputPath);
        if ((resultObj.stdout || "").trim() !== testCases[i].output.trim()) status = "Wrong Output";
        else passedCount++;
      } catch {
        status = "Runtime Error"; // Submit doesn't show full compilation errors
      }

      testcaseResults.push({ testcase: i + 1, result: status, passed: status === "Passed" });
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
    const submissionstatus=passedCount===testCases.length? "success":"failed";
    const submissionObj = { 
      user: userId, 
      username, 
      problem: problem._id,
       language, 
       code,
        passed: passedCount, 
        total: testCases.length,
       status:submissionstatus,
       submittedAt: new Date(),
      };
    
    await Problems.findByIdAndUpdate(problem._id, { $push: { submissions: submissionObj } });

    const existing = await User.findOne({_id:userId,"solvedproblems.problem":problem._id});
    if(existing){
       await User.updateOne(
        {_id:userId, "solvedproblems.problem":problem._id},
      {
        $set:{  
            "solvedproblems.$.language": language,
            "solvedproblems.$.code": code,
            "solvedproblems.$.passed": passedCount,
            "solvedproblems.$.total": testCases.length,
            "solvedproblems.$.status": submissionstatus,
            "solvedproblems.$.lastSubmitted": new Date()

        }
      } );
    }else{
      await User.findByIdAndUpdate(userId,{
        $push: { solvedproblems: {
            problem: problem._id,
            language,
            code,
            passed: passedCount,
            total: testCases.length,
            status: submissionstatus,
            lastSubmitted: new Date(),
          },
        }
      })
    }
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, status: passedCount === testCases.length ? "Success" : "Failed", passed: passedCount, total: testCases.length, testcaseResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Unknown submission error" });
  }
});

export default router;
