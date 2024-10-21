import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getPrivileges,
  getUserName,
  getUser,
  toggleFavoriteProject,
  ensureFavoriteProject,
  getAdvisorUsers,
  getUsersNoProjects,
} from "../controllers/userController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/toggle-favorite", ensureAuthenticated, toggleFavoriteProject);
router.get("/ensure-favorite/:projectId", ensureAuthenticated, ensureFavoriteProject);

router.get("/advisor-users", ensureAuthenticated, isCoordinator, getAdvisorUsers);
router.get("/check-auth", ensureAuthenticated, (req, res) => {
  res.status(200).json({ authenticated: true });
});
router.get("/privileges", ensureAuthenticated, getPrivileges);
router.get("/get-user-name/:id", ensureAuthenticated, getUserName);
router.get("/get-user", ensureAuthenticated, getUser);
router.get("/users-no-projects", ensureAuthenticated, getUsersNoProjects);

export default router;
