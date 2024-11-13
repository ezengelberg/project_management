import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import { updateGrade } from "../controllers/gradeController.js";

const router = express.Router();

router.post("/update/:id", ensureAuthenticated, isCoordinator, updateGrade);

export default router;
