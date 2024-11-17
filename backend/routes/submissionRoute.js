import express from "express";
import {
  createSubmission,
  createSpecificSubmission,
  getAllSubmissions,
  updateJudgesInSubmission,
  getUserSubmissions,
} from "../controllers/submissionController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createSubmission);
router.post("/create-specific", ensureAuthenticated, isCoordinator, createSpecificSubmission);
router.get("/get-all", ensureAuthenticated, isCoordinator, getAllSubmissions);
router.put("/update-judges", ensureAuthenticated, isCoordinator, updateJudgesInSubmission);
router.get("/get-user-submissions", ensureAuthenticated, getUserSubmissions);

export default router;
