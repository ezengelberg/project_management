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
  getUserProfile,
  getAllUsers,
  editUserCoordinator,
  suspendUser,
  unsuspendUser,
  deleteSuspendedUser,
  changePassword,
  registerMultiple,
  checkUserHasProject,
} from "../controllers/userController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register-multiple", registerMultiple);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/toggle-favorite", ensureAuthenticated, toggleFavoriteProject);
router.get("/ensure-favorite/:projectId", ensureAuthenticated, ensureFavoriteProject);
router.get("/get-user-info/:id", ensureAuthenticated, getUserProfile);
router.put("/change-password", ensureAuthenticated, changePassword);
router.get("/advisor-users", ensureAuthenticated, isCoordinator, getAdvisorUsers);
router.get("/check-auth", ensureAuthenticated, (req, res) => {
  res.status(200).json({ authenticated: true });
});
router.get("/privileges", ensureAuthenticated, getPrivileges);
router.get("/get-user-name/:id", ensureAuthenticated, getUserName);
router.get("/get-user", ensureAuthenticated, getUser);
router.get("/users-no-projects", ensureAuthenticated, getUsersNoProjects);
router.get("/all-users", ensureAuthenticated, isCoordinator, getAllUsers);
router.put("/edit-user-coordinator/:userId", ensureAuthenticated, isCoordinator, editUserCoordinator);
router.put("/suspend-user/:userId", ensureAuthenticated, isCoordinator, suspendUser);
router.put("/unsuspend-user/:userId", ensureAuthenticated, isCoordinator, unsuspendUser);
router.delete("/delete-suspended-user/:userId", ensureAuthenticated, isCoordinator, deleteSuspendedUser);
router.get("/check-user-has-projects/:userId", ensureAuthenticated, checkUserHasProject);

export default router;
