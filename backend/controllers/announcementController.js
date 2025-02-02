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
        newAnnouncement.forJudge = true;
      }
      if (roles.coordinator) {
        newAnnouncement.forCoordinator = true;
      }
    }
    if (
      newAnnouncement.forStudent === false &&
      newAnnouncement.forAdvisor === false &&
      newAnnouncement.forJudge === false &&
      newAnnouncement.forCoordinator === false
    ) {
      newAnnouncement.forCoordinator = true;
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
    const { isStudent, isAdvisor, isJudge, isCoordinator, _id } = req.user;
    
    const configFile = await Config.find();
    const year = configFile[0].currentYear;

    // Coordinators should see everything, so no need to filter by project
    let group = null;
    if (!isCoordinator) {
      const project = await Project.findOne({
        $or: [{ students: { $elemMatch: { student: _id } } }, { advisors: { $elemMatch: { $eq: _id } } }],
      });

      if (project) {
        group = await Group.findOne({ projects: project._id });
      }
    }

    // Define conditions based on user roles
    const roleConditions = [];
    if (isStudent) roleConditions.push({ forStudent: true });
    if (isAdvisor) roleConditions.push({ forAdvisor: true });
    if (isJudge) roleConditions.push({ forJudge: true });

    // If the user is a coordinator, they see everything
    let query = isCoordinator
      ? {
          year: year,
      } // No filtering for coordinators
      : {
          $or: roleConditions,
          ...(group?._id && { group: group._id }), // Apply group filter only if available
          year: year,
        };

    // Coordinators also see all coordinator announcements
    if (isCoordinator) {
      query = { $or: [...roleConditions, { forCoordinator: true }] };
    }
    
    const announcements = await Announcement.find(query)
      .populate({ path: "writtenBy", select: "name" }) // Ensuring writtenBy is populated
      .populate({ path: "group", select: "name" });
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
