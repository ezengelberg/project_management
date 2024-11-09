import express from "express";
import { createSubmission, createSpecificSubmission, getAllSubmissions } from "../controllers/submissionController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createSubmission);
router.post("/create-specific", ensureAuthenticated, isCoordinator, createSpecificSubmission);
router.get("/get-all", ensureAuthenticated, isCoordinator, getAllSubmissions);

export default router;
