import Announcement from "../models/announcements.js";
import Config from "../models/config.js";
import Group from "../models/groups.js";
import Project from "../models/projects.js";

export const createAnnouncement = async (req, res) => {
  const { title, description, roles, group } = req.body;
  try {
    const configFile = await Config.find();
    const year = configFile[0].currentYear;
    const newAnnouncement = new Announcement({
      title,
      content: description,
      year: year,
      writtenBy: req.user._id,
    });
    if (group) {
      const groupRes = await Group.findById(group);
      newAnnouncement.group = groupRes;
    }
    if (roles) {
      if (roles.student) {
        newAnnouncement.forStudent = true;
      }
      if (roles.advisor) {
        newAnnouncement.forAdvisor = true;
      }
      if (roles.judge) {
        console.log("ye");
        newAnnouncement.forJudge = true;
      }
      if (roles.coordinator) {
        newAnnouncement.forCoordinator = true;
      }
    }
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(409).json({ message: "Announcement creation failed" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const student = req.user.isStudent;
    const advisor = req.user.isAdvisor;
    const judge = req.user.isJudge;
    const coordinator = req.user.isCoordinator;

    const project = await Project.findOne({
      $or: [
        { students: { $elemMatch: { student: req.user._id } } },
        { advisors: { $elemMatch: { $eq: req.user._id } } },
      ],
    });

    let group;
    if (project) group = await Group.findOne({ projects: project._id });

    console.log(group);
    console.log(student, advisor, judge, coordinator);

    console.log(judge);
    const conditions = [];
    if (student || coordinator) conditions.push({ forStudent: student || coordinator });
    if (advisor || coordinator) conditions.push({ forAdvisor: advisor || coordinator });
    if (judge || coordinator) conditions.push({ forJudge: judge || coordinator });
    const announcements = await Announcement.find({
      $or: [...conditions, { forCoordinator: coordinator }, { group: group?._id || { $exists: true } }],
    }).populate("writtenBy", "name");

    console.log(announcements);
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  await Announcement.findByIdAndUpdate(id, { title, content });
  res.status(200).json({ message: "Editing announcement" });
};
