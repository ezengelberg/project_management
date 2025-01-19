import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import { createAnnouncement } from "../controllers/announcementController.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createAnnouncement);
router.get("/get-all", ensureAuthenticated,)

export default router;
