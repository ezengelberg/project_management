import Mission from "../models/mission.js";

// Create a new mission
export const createMission = async (req, res) => {
  try {
    const mission = new Mission(req.body);
    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all missions
export const getMissions = async (req, res) => {
  try {
    const missions = await Mission.find().populate("journal author assignees subtasks files");
    res.status(200).json(missions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single mission by ID
export const getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id).populate("journal author assignees subtasks files");
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a mission by ID
export const updateMission = async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a mission by ID
export const deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json({ message: "Mission deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
