import express from "express";
import multer from "multer";
import fs from "fs";
import {
  createFile,
  deleteFile,
  downloadFile,
  updateFile,
  getSpecificFileInfo,
  getFiles,
  deleteAllFiles,
} from "../controllers/uploadsController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destination = req.query.destination; // Use
    const uploadPath = `./uploads/${destination}`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", ensureAuthenticated, getFiles);
router.post("/", ensureAuthenticated, upload.array("files", 10), createFile);
router.put("/update/:id", ensureAuthenticated, updateFile);
router.delete("/delete/:id", ensureAuthenticated, deleteFile);
router.get("/download/:id", ensureAuthenticated, downloadFile);
router.get("/info/:id", ensureAuthenticated, getSpecificFileInfo);
router.delete("/delete-all", ensureAuthenticated, deleteAllFiles);

export default router;
