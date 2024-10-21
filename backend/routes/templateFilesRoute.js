import express from "express";
import multer from "multer";
import {
  createTemplateFiles,
  getTemplateFiles,
  deleteTemplateFiles,
  downloadTemplateFile,
} from "../controllers/templateFilesController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./templateFiles");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", ensureAuthenticated, getTemplateFiles);
router.post("/", ensureAuthenticated, upload.array("files", 10), createTemplateFiles);
router.delete("/:id", ensureAuthenticated, deleteTemplateFiles);
router.get("/download/:id", ensureAuthenticated, downloadTemplateFile);

export default router;
