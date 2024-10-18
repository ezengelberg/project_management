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
} from "../controllers/projectController.js";
import { ensureAuthenticated, isAdvisorOrCoordinator, isCoordinator, isAdvisor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/no-advisor", getProjectsNoAdvisor);
router.get("/no-student", getProjectsNoStudent);
router.get("/year/:year", getProjectsByYear);
router.post("/create-project", ensureAuthenticated, isAdvisorOrCoordinator, createProject);
router.put("/:id", ensureAuthenticated, isAdvisorOrCoordinator, updateProject);
router.delete("/:id", ensureAuthenticated, isAdvisorOrCoordinator, deleteProject);
router.put("/:id/add-student", ensureAuthenticated, isAdvisorOrCoordinator, addStudentToProject);
router.put("/:id/remove-student", ensureAuthenticated, isAdvisorOrCoordinator, removeStudentFromProject);
router.put("/:id/close", ensureAuthenticated, isCoordinator, closeProject);
router.put("/:id/add-advisor", ensureAuthenticated, isCoordinator, addAdvisorToProject);

export default router;
