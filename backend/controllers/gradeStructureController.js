import GradeStructure from "../models/gradeStructure.js";
import Group from "../models/groups.js";

export const fetchGradeStructures = async (req, res) => {
  try {
    const gradeStructures = await GradeStructure.find();
    res.status(200).json(gradeStructures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGradeStructure = async (req, res) => {
  const { name, weight, description, date, group } = req.body;

  try {
    let gradeStructure;
    let groupDetails = null;

    if (group !== "all") {
      groupDetails = await Group.findById(group);
    }

    if (group === "all") {
      gradeStructure = await GradeStructure.findOne({ group: null });
    } else {
      gradeStructure = await GradeStructure.findOne({ group });
    }

    if (gradeStructure) {
      gradeStructure.items.push({ name, weight, description, date });
    } else {
      gradeStructure = new GradeStructure({
        group: group === "all" ? null : group,
        groupName: group === "all" ? "כולם" : groupDetails.name,
        items: [{ name, weight, description, date }],
      });
    }

    await gradeStructure.save();
    res.status(201).json(gradeStructure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editGradeStructure = async (req, res) => {
  const { id } = req.params;
  const { name, weight, description, date } = req.body;

  try {
    const gradeStructure = await GradeStructure.findById(id);
    if (!gradeStructure) {
      return res.status(404).json({ message: "Grade structure not found" });
    }
    const itemIndex = gradeStructure.items.findIndex((item) => item._id.toString() === req.body._id);
    if (itemIndex > -1) {
      gradeStructure.items[itemIndex] = { ...gradeStructure.items[itemIndex], name, weight, description, date };
      await gradeStructure.save();
      res.status(200).json(gradeStructure);
    } else {
      res.status(404).json({ message: "Item not found in grade structure" });
    }
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

export const deleteSpecificItem = async (req, res) => {
  const { id, itemId } = req.params;

  try {
    const gradeStructure = await GradeStructure.findById(id);
    if (!gradeStructure) {
      return res.status(404).json({ message: "Grade structure not found" });
    }
    gradeStructure.items = gradeStructure.items.filter((item) => item._id.toString() !== itemId);
    await gradeStructure.save();

    res.status(200).json(gradeStructure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
