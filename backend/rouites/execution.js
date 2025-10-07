import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { authenticate } from "../middleware/requireauth.js";
import fs from "fs";
import path, { dirname } from "path";
import { v4 as uuid } from "uuid";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import Problems from "../models/problems.js";
import User from "../models/users.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Directories
const dirFiles = path.join(__dirname, "..", "programfiles");
const dirCodes = path.join(dirFiles, "codes");
const dirInputs = path.join(dirFiles, "inputs");
const dirOutputs = path.join(dirFiles, "outputs");

// Make directories if not exist
fs.mkdirSync(dirFiles, { recursive: true });
fs.mkdirSync(dirCodes, { recursive: true });
fs.mkdirSync(dirInputs, { recursive: true });
fs.mkdirSync(dirOutputs, { recursive: true });

// Generate code file
const generateFile = async (language, code) => {
  const jobId = uuid();
  const fileName = `${jobId}.${language}`;
  const filePath = path.join(dirCodes, fileName);
  fs.writeFileSync(filePath, code);
  return filePath;
};

// Generate input file
const generateInputFile = async (filePath, input, index) => {
  const jobId = path.basename(filePath).split(".")[0];
  const inputPath = path.join(dirInputs, `${jobId}_${index}.txt`);
  fs.writeFileSync(inputPath, input);
  return inputPath;
};

// Extract Java public class name
const extractPublicClassName = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/public\s+class\s+([A-Za-z_]\w*)/);
  if (match) return match[1];
  throw new Error("No public class found in Java file");
};

// Execute code locally
const executeCode = (filePath, language, inputPath, timeLimit = 5) => {
  return new Promise((resolve, reject) => {
    const jobId = path.basename(filePath).split(".")[0];
    const dir = path.dirname(filePath);
    let compileCommand, compileArgs, runCommand, runArgs;

    switch (language.toLowerCase()) {
      case "cpp":
        compileCommand = "g++";
        compileArgs = [filePath, "-o", path.join(dir, `${jobId}.out`)];
        runCommand = path.join(dir, `${jobId}.out`);
        runArgs = [];
        break;
      case "c":
        compileCommand = "gcc";
        compileArgs = [filePath, "-o", path.join(dir, `${jobId}.out`)];
        runCommand = path.join(dir, `${jobId}.out`);
        runArgs = [];
        break;
      case "java":
        let className;
        try {
          className = extractPublicClassName(filePath);
        } catch (err) {
          return reject({ type: "compilation", stderr: err.message });
        }
        const newFilePath = path.join(dir, `${className}.java`);
        fs.renameSync(filePath, newFilePath);
        compileCommand = "javac";
        compileArgs = [newFilePath];
        runCommand = "java";
        runArgs = ["-cp", dir, className];
        filePath = newFilePath;
        break;
      case "python":
        compileCommand = null;
        runCommand = "python3";
        runArgs = [filePath];
        break;
      case "javascript":
      case "js":
        compileCommand = null;
        runCommand = "node";
        runArgs = [filePath];
        break;
      default:
        return reject({ type: "runtime", stderr: "Unsupported language" });
    }

    const runWithLimits = (cmd, args) => {
      return new Promise((resolveRun, rejectRun) => {
        let stdout = "", stderr = "";
        const startTime = process.hrtime.bigint();

        const run = spawn(cmd, args);

        // Handle input if provided
        if (inputPath && fs.existsSync(inputPath)) {
          const inputData = fs.readFileSync(inputPath, "utf-8");
          run.stdin.write(inputData, () => run.stdin.end());
        } else {
          run.stdin.end();
        }

        const timeout = setTimeout(() => {
          run.kill("SIGTERM");
          rejectRun({ type: "TLE", stderr: `Time limit exceeded (${timeLimit}s)` });
        }, timeLimit * 1000);

        run.stdout.on("data", (data) => (stdout += data.toString()));
        run.stderr.on("data", (data) => (stderr += data.toString()));

        run.on("close", (code) => {
          clearTimeout(timeout);
          const endTime = process.hrtime.bigint();
          const timeTaken = Number(endTime - startTime) / 1e9;
          const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";

          if (code !== 0 && !stdout.trim()) {
            rejectRun({ type: "runtime", stderr });
          } else {
            resolveRun({ stdout, stderr, time: timeTaken.toFixed(3), memory: memUsage });
          }
        });

        run.on("error", (err) => {
          clearTimeout(timeout);
          rejectRun({ type: "runtime", stderr: err.message });
        });
      });
    };

    if (compileCommand) {
      const compile = spawn(compileCommand, compileArgs);
      let compileErr = "";
      compile.stderr.on("data", (data) => (compileErr += data.toString()));
      compile.on("close", async (code) => {
        if (code !== 0) {
          return reject({ type: "compilation", stderr: compileErr });
        }
        try {
          const result = await runWithLimits(runCommand, runArgs);
          // Clean up compiled files
          if (language === "cpp" || language === "c") fs.unlinkSync(path.join(dir, `${jobId}.out`));
          if (language === "java") {
            const classFiles = fs.readdirSync(dir).filter(f => f.endsWith(".class"));
            classFiles.forEach(f => fs.unlinkSync(path.join(dir, f)));
          }
          if (inputPath) fs.unlinkSync(inputPath);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      compile.on("error", (err) => reject({ type: "compilation", stderr: err.message }));
    } else {
      runWithLimits(runCommand, runArgs)
        .then((result) => {
          if (inputPath) fs.unlinkSync(inputPath);
          resolve(result);
        })
        .catch((err) => reject(err));
    }
  });
};

// ======= Run code without submission =======
router.post("/run", authenticate, async (req, res) => {
  const { language, code, input } = req.body;
  if (!code || !language) return res.status(400).json({ success: false, error: "Code and language are required" });

  let filePath, finalFilePath, inputPath;
  try {
    filePath = await generateFile(language, code);
    finalFilePath = filePath;

    if (language.toLowerCase() === "java") {
      const className = extractPublicClassName(filePath);
      finalFilePath = path.join(path.dirname(filePath), `${className}.java`);
      fs.renameSync(filePath, finalFilePath);
    }

    if (input) inputPath = await generateInputFile(finalFilePath, input, 0);

    const result = await executeCode(finalFilePath, language, inputPath, 5);

    res.status(200).json({
      success: true,
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
      memory: result.memory,
      message: "Code executed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: error.type || "Internal Error",
      message: error.stderr || error.message
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (finalFilePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
  }
});

// ======= Submit code with testcases =======
router.post("/submit/:id", authenticate, async (req, res) => {
  try {
    const { language, code, problem } = req.body;
    const userId = req.user.id;
    const username = `${req.user.fname} ${req.user.lname}`;
    if (!code || !language) return res.status(400).json({ success: false, error: "Code and language required" });

    const testCases = problem.testcases;
    const filePath = await generateFile(language, code);
    let passedCount = 0;
    const testcaseResults = [];

    for (let i = 0; i < testCases.length; i++) {
      const inputPath = await generateInputFile(filePath, testCases[i].input, i);
      let outputObj = {};
      let resultStatus = "Passed";

      try {
        outputObj = await executeCode(filePath, language, inputPath, 5);
        if (outputObj.stdout.trim() !== testCases[i].expectedoutput.trim()) {
          resultStatus = "Wrong Output";
        } else {
          passedCount++;
        }
      } catch (error) {
        resultStatus = error.type || "Runtime Error";
        outputObj.stderr = error.stderr || "";
      }

      testcaseResults.push({
        testcase: i + 1,
        result: resultStatus,
        output: outputObj.stdout || "",
        error: outputObj.stderr || "",
        time: outputObj.time || null,
        memory: outputObj.memory || null
      });

      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }

    const status = passedCount === testCases.length ? "Success" : "Failed";

    const submissionObj = {
      user: userId,
      username,
      problem: problem._id,
      language,
      code,
      passed: passedCount,
      total: testCases.length,
      //testcaseResults,
      //status,
      //date: new Date()
    };

    await User.findByIdAndUpdate(userId, { $push: { submissions: submissionObj } });
    await Problems.findByIdAndUpdate(problem._id, { $push: { submissions: submissionObj } });

    res.json({
      success: true,
      message: "Submission processed",
      passed: passedCount,
      total: testCases.length,
      testcaseResults
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
