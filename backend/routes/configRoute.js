import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import Config from "../models/config.js";
import Project from "../models/projects.js";

const router = express.Router();
router.get("/get-config", ensureAuthenticated, async (req, res) => {
  const config = await Config.findOne();
  if (!config) {
    res.status(404);
    throw new Error("Config not found");
  } else {
    res.status(200).json(config);
  }
});

router.post(
  "/update-config",
  ensureAuthenticated,
  isCoordinator,
  async (req, res) => {
    const config = await Config.findOne();
    if (!config) {
      res.status(404);
      throw new Error("Config not found");
    } else {
      for (const [key, value] of Object.entries(req.body)) {
        config[key] = value;
      }
      await config.save();
      res.status(200).json("Configuration file updated successfully");
    }
  }
);

router.get("/get/year", ensureAuthenticated, async (req, res) => {
  const config = await Config.findOne();
  const projectYears = await Project.find().distinct("year");
  console.log(projectYears);
  console.log(config.currentYear);

  if (!config) {
    res.status(404);
    throw new Error("Config not found");
  } else {
    res.status(200).json({current: config.currentYear, years: projectYears});
  }
});

export default router;
