import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { fetchChat, fetchChats, fetchMessages, fetchUsers, sendMessage, updateChatName } from "../controllers/chatController.js";

const router = express.Router();
router.get("/", ensureAuthenticated, fetchChats);
router.get("/fetch-users", ensureAuthenticated, fetchUsers);
router.post("/send", ensureAuthenticated, sendMessage);
router.get("/messages", ensureAuthenticated, fetchMessages);
router.post("/update/name/:id", ensureAuthenticated, updateChatName);
router.get("/:id", ensureAuthenticated, fetchChat);
export default router;
