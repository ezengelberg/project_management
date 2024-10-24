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
  checkIfUserIsCandidate
} from "../controllers/projectController.js";
import { ensureAuthenticated, isAdvisorOrCoordinator, isCoordinator } from "../middleware/auth.js";
import { getAvailableProjects, getProject, addCandidateToProject, removeCandidateFromProject, getSelfProjects } from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/create-project", ensureAuthenticated, isAdvisorOrCoordinator, createProject);
router.get("/available-projects", ensureAuthenticated, getAvailableProjects);
router.get("/no-student", getProjectsNoStudent);
router.get("/get-project/:id", getProject);
router.post("/add-candidate", ensureAuthenticated, addCandidateToProject);
router.post("/remove-candidate", ensureAuthenticated, removeCandidateFromProject);
router.get("/check-if-candidate/:id", ensureAuthenticated, checkIfUserIsCandidate);
router.get("/get-self-projects", ensureAuthenticated, isAdvisorOrCoordinator, getSelfProjects);

router.get("/no-advisor", getProjectsNoAdvisor);
router.get("/year/:year", getProjectsByYear);
router.put("/:id", ensureAuthenticated, isAdvisorOrCoordinator, updateProject);
router.delete("/:id", ensureAuthenticated, isAdvisorOrCoordinator, deleteProject);
router.put("/:id/add-student", ensureAuthenticated, isAdvisorOrCoordinator, addStudentToProject);
router.put("/:id/remove-student", ensureAuthenticated, isAdvisorOrCoordinator, removeStudentFromProject);
router.put("/:id/close", ensureAuthenticated, isCoordinator, closeProject);
router.put("/:id/add-advisor", ensureAuthenticated, isCoordinator, addAdvisorToProject);
router.get("/status", ensureAuthenticated, getProjectsStatus);

export default router;
