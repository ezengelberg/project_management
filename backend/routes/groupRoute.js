import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import {
  createNewGroup,
  getGroups,
  renameGroup,
  addProjects,
  removeProjects,
  deleteGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createNewGroup);
router.get("/get", ensureAuthenticated, isCoordinator, getGroups);
router.put("/rename", ensureAuthenticated, isCoordinator, renameGroup);
router.put("/add-projects", ensureAuthenticated, isCoordinator, addProjects);
router.put("/remove-projects", ensureAuthenticated, isCoordinator, removeProjects);
router.delete("/delete", ensureAuthenticated, isCoordinator, deleteGroup);

export default router;
