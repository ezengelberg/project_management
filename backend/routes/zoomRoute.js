import express from "express";
import { createMeeting, getMeetings, deleteMeeting } from "../controllers/zoomController.js";
import { ensureAuthenticated, isAdvisorOrCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-meeting", ensureAuthenticated, isAdvisorOrCoordinator, createMeeting);
router.get("/meetings", ensureAuthenticated, getMeetings);
router.delete("/meetings/:meetingId", ensureAuthenticated, deleteMeeting);

export default router;
