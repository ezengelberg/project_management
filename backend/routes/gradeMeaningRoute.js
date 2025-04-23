import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import { getGradeMeanings, updateGradeMeanings } from "../controllers/gradeMeaningController.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getGradeMeanings);
router.put("/", ensureAuthenticated, isCoordinator, updateGradeMeanings);

export default router;
