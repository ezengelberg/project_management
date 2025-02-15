import express from "express";
import {
  createSubmission,
  createSpecificSubmission,
  getAllSubmissions,
  updateJudgesInSubmission,
  getJudgeSubmissions,
  getSubmission,
  getAllProjectSubmissions,
  getSubmissionDetails,
  getStudentSubmissions,
  updateSubmissionFile,
  updateSubmissionInformation,
  updateSpecificSubmission,
  deleteActiveSubmissions,
  deleteSubmission,
  getSpecificProjectSubmissions,
  assignJudgesAutomatically,
  getGradeDistribution,
  deleteAllSubmissions,
  resetJudges,
  assignJudgesAI,
  askForExtraUpload,
  getExtraUploadSubmissions,
  acceptExtraUpload,
  denyExtraUpload,
} from "../controllers/submissionController.js";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", ensureAuthenticated, isCoordinator, createSubmission);
router.post("/create-specific", ensureAuthenticated, isCoordinator, createSpecificSubmission);
router.get("/get-all", ensureAuthenticated, isCoordinator, getAllSubmissions);
router.get("/get-all-project-submissions", ensureAuthenticated, isCoordinator, getAllProjectSubmissions);
router.get("/get-specific-project-submissions/:projectId", ensureAuthenticated, getSpecificProjectSubmissions);
router.put("/update-judges", ensureAuthenticated, isCoordinator, updateJudgesInSubmission);
router.delete("/reset-all-judges", ensureAuthenticated, isCoordinator, resetJudges);
router.get("/get-judge-submissions", ensureAuthenticated, getJudgeSubmissions);
router.get("/get-submission/:id", ensureAuthenticated, getSubmission);
router.get("/get-submission-details/:id", ensureAuthenticated, getSubmissionDetails);
router.get("/get-student-submissions", ensureAuthenticated, getStudentSubmissions);
router.post("/update-submission-file/:id", ensureAuthenticated, updateSubmissionFile);
router.post("/update-submission-information", ensureAuthenticated, isCoordinator, updateSubmissionInformation);
router.post("/update-specific-submission/:id", ensureAuthenticated, isCoordinator, updateSpecificSubmission);
router.post("/delete-active-submissions", ensureAuthenticated, isCoordinator, deleteActiveSubmissions);
router.delete("/delete-specific-submission/:id", ensureAuthenticated, isCoordinator, deleteSubmission);
router.post("/assign-judge-auto", ensureAuthenticated, isCoordinator, assignJudgesAutomatically);
router.post("/assign-judge-ai", ensureAuthenticated, isCoordinator, assignJudgesAI);
router.get("/grade-distribution/:id", ensureAuthenticated, getGradeDistribution);
router.delete("/delete-all", ensureAuthenticated, isCoordinator, deleteAllSubmissions);
router.post("/ask-for-extra-upload/:id", ensureAuthenticated, askForExtraUpload);
router.get("/get-extra-upload-submissions", ensureAuthenticated, isCoordinator, getExtraUploadSubmissions);
router.post("/accept-extra-upload/:id", ensureAuthenticated, isCoordinator, acceptExtraUpload);
router.post("/deny-extra-upload/:id", ensureAuthenticated, isCoordinator, denyExtraUpload);

export default router;
