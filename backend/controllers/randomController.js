import Random from "../models/random.js";

export const fetchDescriptionForGradeStructure = async (req, res) => {
  try {
    const randomText = await Random.find();
    res.status(200).json(randomText);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDescriptionForGradeStructure = async (req, res) => {
  const { descriptionForGradeStructure } = req.body;
  const newRandomText = new Random({ descriptionForGradeStructure });

  try {
    await newRandomText.save();
    res.status(201).json(newRandomText);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editDescriptionForGradeStructure = async (req, res) => {
  const { id } = req.params;
  const { descriptionForGradeStructure } = req.body;

  try {
    const updatedRandomText = await Random.findByIdAndUpdate(id, { descriptionForGradeStructure }, { new: true });
    res.status(200).json(updatedRandomText);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDescriptionForGradeStructure = async (req, res) => {
  const { id } = req.params;

  try {
    await Random.findByIdAndDelete(id);
    res.status(200).json({ message: "Random text deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
