import express from "express";
import {
  getProjects,
  createProject,
  getProjectsNoStudent,
  checkIfUserIsCandidate,
  approveCandidate,
  removeStudentFromProject,
  switchProjectRegistration,
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
  terminateProject,
  deleteProject,
  restoreProject,
  assignAdvisorsAutomatically,
  getActiveProjects,
  getProjectYears,
  startProjectsCoordinator,
  deleteAllProjects,
  createExamTable,
  getExamTables,
  editExamTableClasses,
  deleteExamTable,
  createExamTableManuel,
  deleteExamTableCell,
  addExamTableCell,
  getProjectJudges,
  getProjectsForExamTable,
  editExamTableDates,
} from "../controllers/projectController.js";
import { ensureAuthenticated, isAdvisorOrCoordinator, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/create-project", ensureAuthenticated, isAdvisorOrCoordinator, createProject);
router.get("/available-projects", ensureAuthenticated, getAvailableProjects);
router.get("/get-active-projects", getActiveProjects);
router.get("/no-student", getProjectsNoStudent);
router.get("/get-project/:id", getProject);
router.post("/add-candidate", ensureAuthenticated, addCandidateToProject);
router.get("/check-if-candidate/:id", ensureAuthenticated, checkIfUserIsCandidate);
router.get("/get-self-projects", ensureAuthenticated, isAdvisorOrCoordinator, getSelfProjects);
router.post("/remove-candidate", ensureAuthenticated, removeCandidateFromProject);
router.post("/approve-candidate", ensureAuthenticated, isAdvisorOrCoordinator, approveCandidate);
router.post("/remove-student", ensureAuthenticated, isAdvisorOrCoordinator, removeStudentFromProject);
router.post("/switch-registration", ensureAuthenticated, isAdvisorOrCoordinator, switchProjectRegistration);
router.put("/edit-project/:id", ensureAuthenticated, isAdvisorOrCoordinator, updateProject);
router.post("/add-advisor", ensureAuthenticated, isCoordinator, addAdvisorToProject);
router.post("/add-student", ensureAuthenticated, isCoordinator, addStudentToProject);
router.put("/update-students", ensureAuthenticated, isCoordinator, updateStudentsInProject);
router.put("/update-advisor", ensureAuthenticated, isCoordinator, updateAdvisorInProject);
router.put("/terminate-project", ensureAuthenticated, isCoordinator, terminateProject);
router.delete("/delete-project/:id", ensureAuthenticated, isCoordinator, deleteProject);
router.put("/restore-project/:id", ensureAuthenticated, isCoordinator, restoreProject);
router.post("/assign-advisors-automatically", ensureAuthenticated, isCoordinator, assignAdvisorsAutomatically);
router.put("/start-projects-coordinator", ensureAuthenticated, isCoordinator, startProjectsCoordinator);
router.get("/years", ensureAuthenticated, getProjectYears);
router.delete("/delete-all", ensureAuthenticated, isCoordinator, deleteAllProjects);
router.post("/create-exam-table", ensureAuthenticated, isCoordinator, createExamTable);
router.get("/get-exam-tables", ensureAuthenticated, getExamTables);
router.put("/edit-exam-table-classes/:id", ensureAuthenticated, isCoordinator, editExamTableClasses);
router.delete("/delete-exam-table/:id", ensureAuthenticated, isCoordinator, deleteExamTable);
router.post("/create-exam-table-manuel", ensureAuthenticated, isCoordinator, createExamTableManuel);
router.delete("/delete-exam-table-cell/:id", ensureAuthenticated, isCoordinator, deleteExamTableCell);
router.post("/add-exam-table-cell/:id", ensureAuthenticated, isCoordinator, addExamTableCell);
router.get("/get-judges/:id", ensureAuthenticated, isCoordinator, getProjectJudges);
router.get("/get-projects-for-exam-table", ensureAuthenticated, getProjectsForExamTable);
router.put("/edit-exam-table-dates/:id", ensureAuthenticated, isCoordinator, editExamTableDates);

export default router;
