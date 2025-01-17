import express from "express";
import {
  fetchDescriptionForGradeStructure,
  createDescriptionForGradeStructure,
  editDescriptionForGradeStructure,
  deleteDescriptionForGradeStructure,
} from "../controllers/randomController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.get("/description-for-grade-structure", ensureAuthenticated, isCoordinator, fetchDescriptionForGradeStructure);
router.post(
  "/create-description-for-grade-structure",
  ensureAuthenticated,
  isCoordinator,
  createDescriptionForGradeStructure
);
router.put(
  "/edit-description-for-grade-structure/:id",
  ensureAuthenticated,
  isCoordinator,
  editDescriptionForGradeStructure
);
router.delete(
  "/delete-description-for-grade-structure/:id",
  ensureAuthenticated,
  isCoordinator,
  deleteDescriptionForGradeStructure
);

export default router;
