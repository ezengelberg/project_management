import Announcement from "../models/announcements.js";
import Config from "../models/config.js";
import Group from "../models/groups.js";

export const createAnnouncement = async (req, res) => {
  const { title, description, roles, group } = req.body;
  try {
    console.log("creating announcement");
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
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(409).json({ message: "Announcement creation failed" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
