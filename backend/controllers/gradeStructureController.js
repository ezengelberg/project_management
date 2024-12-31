import GradeStructure from "../models/gradeStructure.js";

export const fetchGradeStructures = async (req, res) => {
  try {
    const gradeStructures = await GradeStructure.find();
    res.status(200).json(gradeStructures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGradeStructure = async (req, res) => {
  const { name, weight, description, date, tachlit } = req.body;
  const newGradeStructure = new GradeStructure({ name, weight, description, date, tachlit });

  try {
    await newGradeStructure.save();
    res.status(201).json(newGradeStructure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editGradeStructure = async (req, res) => {
  const { id } = req.params;
  const { name, weight, description, date, tachlit } = req.body;

  try {
    const updatedGradeStructure = await GradeStructure.findByIdAndUpdate(
      id,
      { name, weight, description, date, tachlit },
      { new: true }
    );
    res.status(200).json(updatedGradeStructure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGradeStructure = async (req, res) => {
  const { id } = req.params;

  try {
    await GradeStructure.findByIdAndDelete(id);
    res.status(200).json({ message: "Grade structure deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
