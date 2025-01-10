import Group from "../models/groups.js";

export const createNewGroup = async (req, res) => {
  try {
    const { name, projects } = req.body;
    const newGroup = new Group({ name, projects });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { groupId, newName } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    group.name = newName;
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addProjects = async (req, res) => {
  try {
    const { groupId, projectIds } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    group.projects.push(...projectIds);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeProjects = async (req, res) => {
  try {
    const { groupId, projectIds } = req.body;
    const group = await Group.findById(groupId).populate("projects");
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    group.projects = group.projects.filter((project) => !projectIds.includes(project._id.toString()));
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
