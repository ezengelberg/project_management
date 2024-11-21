import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import {
  addGrade,
  updateGrade,
  getGradeBySubmission,
  updateNumericValues,
  getNumericValues,
} from "../controllers/gradeController.js";

const router = express.Router();

router.post("/add-grade", ensureAuthenticated, addGrade);
router.put("/update-grade/:id", ensureAuthenticated, isCoordinator, updateGrade);
router.get("/submission/:submissionId", ensureAuthenticated, getGradeBySubmission);
router.put("/update-numeric-values", ensureAuthenticated, isCoordinator, updateNumericValues);
router.get("/get-numeric-values", ensureAuthenticated, getNumericValues);

export default router;
