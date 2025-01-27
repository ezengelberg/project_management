import express from "express";
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} from "../controllers/journalController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/", ensureAuthenticated, createJournalEntry);
router.get("/", ensureAuthenticated, getJournalEntries);
router.get("/:missionId", ensureAuthenticated, getJournalEntryById);
router.put("/:missionId", ensureAuthenticated, updateJournalEntry);
router.delete("/:missionId", ensureAuthenticated, deleteJournalEntry);

export default router;
