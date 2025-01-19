import Announcement from "../models/announcements.js";
import Config from "../models/config.js";
import Group from "../models/groups.js";
import Project from "../models/projects.js";

export const createAnnouncement = async (req, res) => {
  const { title, description, roles, group } = req.body;
  try {
    console.log("creating announcement");
    console.log(req.body);
    const configFile = await Config.find();
    const year = configFile[0].currentYear;
    const newAnnouncement = new Announcement({
      title,
      content: description,
      year: year,
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

    const group = await Group.findOne({ projects: project._id });
    const announcements = await Announcement.find({
      $or: [
        { forStudent: student || coordinator },
        { forAdvisor: advisor || coordinator },
        { forJudge: judge || coordinator },
        { forCoordinator: coordinator },
        { group: group._id },
      ],
    });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
