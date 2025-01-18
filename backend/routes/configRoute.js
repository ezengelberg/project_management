import express from "express";
import { ensureAuthenticated, isCoordinator } from "../middleware/auth.js";
import Config from "../models/config.js";

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

router.post("/update-config", ensureAuthenticated, isCoordinator, async (req, res) => {
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
});

export default router;
