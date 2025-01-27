import express from "express";
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  createLabel,
  getLabels,
  deleteLabel,
} from "../controllers/journalController.js";

const router = express.Router({ mergeParams: true });

router.post("/", createJournalEntry);
router.get("/", getJournalEntries);
router.get("/:missionId", getJournalEntryById);
router.put("/:missionId", updateJournalEntry);
router.delete("/:missionId", deleteJournalEntry);

router.post("/labels", createLabel);
router.get("/labels", getLabels);
router.delete("/labels/:labelId", deleteLabel);

export default router;
