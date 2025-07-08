import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import {
  createNewGroup,
  getGroups,
  renameGroup,
  addProjects,
  removeProjects,
  deleteGroup,
  getGroupProjects,
  getYearGroups,
  getGroupByYear,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createNewGroup);
router.get("/get", ensureAuthenticated, getGroups);
router.get("/get-current-year", ensureAuthenticated, getYearGroups);
router.get("/get-by-year/:year", ensureAuthenticated, getGroupByYear);
router.put("/rename", ensureAuthenticated, isCoordinator, renameGroup);
router.put("/add-projects", ensureAuthenticated, isCoordinator, addProjects);
router.put("/remove-projects", ensureAuthenticated, isCoordinator, removeProjects);
router.delete("/delete", ensureAuthenticated, isCoordinator, deleteGroup);
router.get("/get-projects/:groupId", ensureAuthenticated, isCoordinator, getGroupProjects);

export default router;
