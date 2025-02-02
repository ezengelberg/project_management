import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { fetchChats } from "../controllers/chatController.js";

const router = express.Router();
router.get("/fetch", ensureAuthenticated, fetchChats);
export default router;