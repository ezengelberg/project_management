import express from "express";
import { loginUser, logoutUser, registerUser, getUsersNoProjects } from "../controllers/userController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
