import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { fetchChats, fetchUsers, sendMessage } from "../controllers/chatController.js";

const router = express.Router();
router.get("/", ensureAuthenticated, fetchChats);
router.get("/fetch-users", ensureAuthenticated, fetchUsers);
router.post("/send", ensureAuthenticated, sendMessage);
export default router;
