import Project from "../models/projects.js";
import Submission from "../models/submission.js";

export const createSubmission = async (req, res) => {
  console.log("Creating submission");
  console.log(req.body);
  try {
    const projects = await Project.find({ isTerminated: false, isFinished: false });
    await Promise.all(
      projects.map(async (project) => {
        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          closeDate: new Date(req.body.endDate),
          openDate: new Date(req.body.startDate)
        });
        await submission.save();
      })
    );
    res.status(201).json({ message: "Submissions created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createSpecificSubmission = async (req, res) => {
  try {
    await Promise.all(
      req.body.projects.map(async (projectId) => {
        const project = await Project.findById(projectId);
        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          closeDate: new Date(req.body.endDate),
          openDate: new Date(req.body.startDate)
        });
        await submission.save();
      })
    );
    res.status(201).json({ message: "Submissions created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
