import express from "express";
import {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  deleteMission,
  getMissionsByProjectId,
} from "../controllers/missionController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/", ensureAuthenticated, createMission);
router.get("/", ensureAuthenticated, getMissions);
router.get("/:id", ensureAuthenticated, getMissionById);
router.put("/:id", ensureAuthenticated, updateMission);
router.delete("/:id", ensureAuthenticated, deleteMission);
router.get("/project/:projectId", ensureAuthenticated, getMissionsByProjectId);

export default router;
