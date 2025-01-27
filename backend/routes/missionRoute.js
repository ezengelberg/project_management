import express from "express";
import {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  deleteMission,
} from "../controllers/missionController.js";

const router = express.Router();

router.post("/", createMission);
router.get("/", getMissions);
router.get("/:id", getMissionById);
router.put("/:id", updateMission);
router.delete("/:id", deleteMission);

export default router;
