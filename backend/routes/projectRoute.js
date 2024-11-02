import express from "express";
import {
  getProjects,
  createProject,
  getProjectsNoStudent,
  checkIfUserIsCandidate,
  approveCandidate,
  removeStudentFromProject,
  switchProjectRegistration,
  getProjectsStatus,
  updateProject,
  getAvailableProjects,
  getProject,
  addCandidateToProject,
  removeCandidateFromProject,
  getSelfProjects,
  addAdvisorToProject,
  addStudentToProject,
  updateStudentsInProject,
  updateAdvisorInProject,
  addJudgesToProject,
  updateJudgesInProject,
  terminateProject,
  deleteProject,
  restoreProject,
} from "../controllers/projectController.js";
import { ensureAuthenticated, isAdvisorOrCoordinator, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/create-project", ensureAuthenticated, isAdvisorOrCoordinator, createProject);
router.get("/available-projects", ensureAuthenticated, getAvailableProjects);
router.get("/no-student", getProjectsNoStudent);
router.get("/get-project/:id", getProject);
router.post("/add-candidate", ensureAuthenticated, addCandidateToProject);
router.get("/check-if-candidate/:id", ensureAuthenticated, checkIfUserIsCandidate);
router.get("/get-self-projects", ensureAuthenticated, isAdvisorOrCoordinator, getSelfProjects);
router.post("/remove-candidate", ensureAuthenticated, removeCandidateFromProject);
router.post("/approve-candidate", ensureAuthenticated, isAdvisorOrCoordinator, approveCandidate);
router.post("/remove-student", ensureAuthenticated, isAdvisorOrCoordinator, removeStudentFromProject);
router.post("/switch-registration", ensureAuthenticated, isAdvisorOrCoordinator, switchProjectRegistration);
router.get("/status", getProjectsStatus);
router.put("/edit-project/:id", ensureAuthenticated, isAdvisorOrCoordinator, updateProject);
router.post("/add-advisor", ensureAuthenticated, isCoordinator, addAdvisorToProject);
router.post("/add-student", ensureAuthenticated, isCoordinator, addStudentToProject);
router.put("/update-students", ensureAuthenticated, isCoordinator, updateStudentsInProject);
router.put("/update-advisor", ensureAuthenticated, isCoordinator, updateAdvisorInProject);
router.post("/add-judges", ensureAuthenticated, isCoordinator, addJudgesToProject);
router.put("/update-judges", ensureAuthenticated, isCoordinator, updateJudgesInProject);
router.put("/terminate-project", ensureAuthenticated, isCoordinator, terminateProject);
router.delete("/delete-project/:id", ensureAuthenticated, isCoordinator, deleteProject);
router.put("/restore-project/:id", ensureAuthenticated, isCoordinator, restoreProject);

export default router;
