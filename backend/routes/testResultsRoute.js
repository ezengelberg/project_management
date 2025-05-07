import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/list-results", (req, res) => {
  const resultsDir = path.join(process.cwd(), "K6_Tests", "results");

  if (!fs.existsSync(resultsDir)) {
    console.error("Results directory does not exist:", resultsDir);
    return res.status(500).json({ message: "Results directory does not exist" });
  }

  fs.readdir(resultsDir, (err, files) => {
    if (err) {
      console.error("Error reading results directory:", err);
      return res.status(500).json({ message: "Failed to list files" });
    }
    const txtFiles = files.filter((file) => file.endsWith(".txt"));
    res.json(txtFiles);
  });
});

router.get("/download/:filename", (req, res) => {
  const resultsDir = path.join(process.cwd(), "K6_Tests", "results");
  const filePath = path.join(resultsDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  res.download(filePath);
});

export default router;
