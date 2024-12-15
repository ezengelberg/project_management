import express from "express";
import {
  fetchDescriptionForGradeStructure,
  createDescriptionForGradeStructure,
  editDescriptionForGradeStructure,
  deleteDescriptionForGradeStructure,
} from "../controllers/randomController.js";

const router = express.Router();

router.get("/description-for-grade-structure", fetchDescriptionForGradeStructure);
router.post("/create-description-for-grade-structure", createDescriptionForGradeStructure);
router.put("/edit-description-for-grade-structure/:id", editDescriptionForGradeStructure);
router.delete("/delete-description-for-grade-structure/:id", deleteDescriptionForGradeStructure);

export default router;
