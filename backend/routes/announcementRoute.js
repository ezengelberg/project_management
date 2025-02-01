import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import { createAnnouncement, deleteAnnouncement, editAnnouncement, getAnnouncements } from "../controllers/announcementController.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createAnnouncement);
router.get("/get-all", ensureAuthenticated, getAnnouncements)
router.delete("/delete/:id", ensureAuthenticated, isCoordinator, deleteAnnouncement);
router.put("/edit/:id", ensureAuthenticated, isCoordinator, editAnnouncement);

export default router;
