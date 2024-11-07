import express from "express";
import multer from "multer";
import { createFile, deleteFile, downloadFile, getFiles, updateFile } from "../controllers/uploadsController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, cb) {
    const destination = req.body.destination;
    console.log(req.body);
    cb(null, `./uploads/${destination}`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/", ensureAuthenticated, getFiles);
router.post("/", ensureAuthenticated, upload.array("files", 10), createFile);
router.put("/update/:id", ensureAuthenticated, updateFile);
router.delete("/delete/:id", ensureAuthenticated, deleteFile);
router.get("/download/:id", ensureAuthenticated, downloadFile);

export default router;
