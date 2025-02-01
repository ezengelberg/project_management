import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import { createAnnouncement, getAnnouncements } from "../controllers/announcementController.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createAnnouncement);
router.get("/get-all", ensureAuthenticated, getAnnouncements)

export default router;
