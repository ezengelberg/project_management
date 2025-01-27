import Label from "../models/label.js";

// Create a new label
export const createLabel = async (req, res) => {
  try {
    const label = new Label(req.body);
    await label.save();
    res.status(201).json(label);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all labels
export const getLabels = async (req, res) => {
  try {
    const labels = await Label.find();
    res.status(200).json(labels);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single label by ID
export const getLabelById = async (req, res) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ error: "Label not found" });
    }
    res.status(200).json(label);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a label by ID
export const updateLabel = async (req, res) => {
  try {
    const label = await Label.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!label) {
      return res.status(404).json({ error: "Label not found" });
    }
    res.status(200).json(label);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a label by ID
export const deleteLabel = async (req, res) => {
  try {
    const label = await Label.findByIdAndDelete(req.params.id);
    if (!label) {
      return res.status(404).json({ error: "Label not found" });
    }
    res.status(200).json({ message: "Label deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
