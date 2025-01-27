import Project from "../models/projects.js";

// Create a new journal entry
export const createJournalEntry = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    project.journal.missions.push(req.body.missionId);
    await project.save();
    res.status(201).json(project.journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all journal entries for a project
export const getJournalEntries = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("journal.missions");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project.journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single journal entry by ID
export const getJournalEntryById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("journal.missions");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const mission = project.journal.missions.id(req.params.missionId);
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a journal entry by ID
export const updateJournalEntry = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const mission = project.journal.missions.id(req.params.missionId);
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    Object.assign(mission, req.body);
    await project.save();
    res.status(200).json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a journal entry by ID
export const deleteJournalEntry = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const mission = project.journal.missions.id(req.params.missionId);
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    mission.remove();
    await project.save();
    res.status(200).json({ message: "Mission deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
