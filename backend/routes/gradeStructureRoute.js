import express from "express";
import {
  fetchGradeStructures,
  createGradeStructure,
  editGradeStructure,
  deleteGradeStructure,
} from "../controllers/gradeStructureController.js";

const router = express.Router();

router.get("/", fetchGradeStructures);
router.post("/", createGradeStructure);
router.put("/:id", editGradeStructure);
router.delete("/:id", deleteGradeStructure);

export default router;
