import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { fetchChats, fetchUsers } from "../controllers/chatController.js";

const router = express.Router();
router.get("/fetch", ensureAuthenticated, fetchChats);
router.get("/fetch-users", ensureAuthenticated, fetchUsers);
export default router;
