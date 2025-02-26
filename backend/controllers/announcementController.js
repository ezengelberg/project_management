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

        // Refetch and populate
        const populatedAnnouncement = await Announcement.findById(newAnnouncement._id)
            .populate("writtenBy", "name")
            .populate("group", "name");
        res.status(201).json({ message: "Announcement created", announcement: populatedAnnouncement });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(409).json({ message: "Announcement creation failed" });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const { isStudent, isAdvisor, isJudge, isCoordinator, _id } = req.user;

        console.log("User roles:", { isStudent, isAdvisor, isJudge, isCoordinator });

        const configFile = await Config.find();
        const year = configFile[0].currentYear;

        // Coordinators should see everything, so no need to filter by project
        let group = null;
        const project = await Project.findOne({
            $or: [{ students: { $elemMatch: { student: _id } } }, { advisors: { $elemMatch: { $eq: _id } } }],
        });

        if (project) {
            group = await Group.findOne({ projects: project._id });
        }

        console.log("Group:", group);

        // Define conditions based on user roles
        const roleConditions = [];
        if (isStudent) roleConditions.push({ forStudent: true });
        if (isAdvisor) roleConditions.push({ forAdvisor: true });
        if (isJudge) roleConditions.push({ forJudge: true });

        // If the user is a coordinator, they see everything
        let query;

        if (isCoordinator) {
            // Coordinators see everything from the current year
            query = { year: year };
        } else {
            // For non-coordinators, we need both role AND group conditions to match
            query = {
                year: year,
                $and: [
                    // Must match at least one role condition
                    { $or: roleConditions },

                    // AND must match the appropriate group condition
                    group?._id
                        ? { $or: [{ group: { $exists: false } }, { group: null }, { group: group._id }] }
                        : {
                              $or: [{ group: { $exists: false } }, { group: null }],
                          },
                ],
            };
        }

        console.log("Query:", JSON.stringify(query, null, 2));

        const announcements = await Announcement.find(query)
            .populate({ path: "writtenBy", select: "name" }) // Ensuring writtenBy is populated
            .populate({ path: "group", select: "name" });

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
