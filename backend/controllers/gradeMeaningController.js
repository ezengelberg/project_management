import GradeMeaning from "../models/gradeMeaning.js";

export const getGradeMeanings = async (req, res) => {
  try {
    const gradeMeaning = await GradeMeaning.findOne();
    if (!gradeMeaning) {
      // Create a default grade meanings document if none exists
      gradeMeaning = await GradeMeaning.create({});
    }
    res.status(200).json(gradeMeaning.gradesMeaning);
  } catch (error) {
    console.error("Error fetching grade meanings:", error);
    res.status(500).json({ message: "Error fetching grade meanings" });
  }
};

export const updateGradeMeanings = async (req, res) => {
  try {
    const { gradesMeaning } = req.body;
    const gradeMeaning = await GradeMeaning.findOneAndUpdate({}, { gradesMeaning }, { new: true, upsert: true });
    res.status(200).json(gradeMeaning.gradesMeaning);
  } catch (error) {
    console.error("Error updating grade meanings:", error);
    res.status(500).json({ message: "Error updating grade meanings" });
  }
};
