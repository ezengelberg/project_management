import express from "express";
import { createLabel, getLabels, getLabelById, updateLabel, deleteLabel } from "../controllers/labelController.js";

const router = express.Router();

router.post("/", createLabel);
router.get("/", getLabels);
router.get("/:id", getLabelById);
router.put("/:id", updateLabel);
router.delete("/:id", deleteLabel);

export default router;
