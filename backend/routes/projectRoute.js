import express from "express";
import {
  getProjects,
  getProjectsByYear,
  createProject,
  updateProject,
  deleteProject,
  getProjectsNoAdvisor,
  getProjectsNoStudent,
  addStudentToProject,
  removeStudentFromProject,
  closeProject,
  addAdvisorToProject,
  getProjectsStatus,
} from "../controllers/projectController.js";
import { ensureAuthenticated, isAdvisorOrCoordinator, isCoordinator } from "../middleware/auth.js";
import { getAvailableProjects } from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/create-project", ensureAuthenticated, isAdvisorOrCoordinator, createProject);
router.get("/available-projects", ensureAuthenticated, getAvailableProjects);

router.get("/no-advisor", getProjectsNoAdvisor);
router.get("/no-student", getProjectsNoStudent);
router.get("/year/:year", getProjectsByYear);
router.put("/:id", ensureAuthenticated, isAdvisorOrCoordinator, updateProject);
router.delete("/:id", ensureAuthenticated, isAdvisorOrCoordinator, deleteProject);
router.put("/:id/add-student", ensureAuthenticated, isAdvisorOrCoordinator, addStudentToProject);
router.put("/:id/remove-student", ensureAuthenticated, isAdvisorOrCoordinator, removeStudentFromProject);
router.put("/:id/close", ensureAuthenticated, isCoordinator, closeProject);
router.put("/:id/add-advisor", ensureAuthenticated, isCoordinator, addAdvisorToProject);
router.get("/status", ensureAuthenticated, getProjectsStatus);

export default router;
