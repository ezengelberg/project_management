import express from 'express';
import { createSubmission, createSpecificSubmission } from '../controllers/submissionController.js';
import { ensureAuthenticated, isCoordinator } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', ensureAuthenticated, isCoordinator, createSubmission);
router.post('/create-specific', ensureAuthenticated, isCoordinator, createSpecificSubmission);

export default router;