import express from "express";
import {
  fetchGradeStructures,
  createGradeStructure,
  editGradeStructure,
  deleteGradeStructure,
  deleteSpecificItem,
  getGradeStructureYears,
  getYearGroupStructures,
} from "../controllers/gradeStructureController.js";

const router = express.Router();

router.get("/", fetchGradeStructures);
router.get("/years", getGradeStructureYears);
router.get("/year/:year", getYearGroupStructures);
router.post("/", createGradeStructure);
router.put("/:id", editGradeStructure);
router.delete("/:id", deleteGradeStructure);
router.delete("/item/:id/:itemId", deleteSpecificItem);

export default router;
