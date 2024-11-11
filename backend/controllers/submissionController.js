import Project from "../models/projects.js";
import Submission from "../models/submission.js";
import User from "../models/users.js";
import Grade from "../models/grades.js";

export const createSubmission = async (req, res) => {
  console.log("Creating submission");
  console.log(req.body);
  try {
    const projects = await Project.find({ isTerminated: false, isFinished: false });
    await Promise.all(
      projects.map(async (project) => {
        let newGrade;
        let gradeByAdvisor;
        if (project.advisors.length > 0) {
          newGrade = new Grade({ judge: project.advisors[0]._id });
          gradeByAdvisor = await newGrade.save();
        }
        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          submissionDate: new Date(req.body.submissionDate),
          grades: [gradeByAdvisor]
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

        let newGrade;
        let gradeByAdvisor;
        if (project.advisors.length > 0) {
          newGrade = new Grade({ judge: project.advisors[0]._id });
          gradeByAdvisor = await newGrade.save();
        }

        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          submissionDate: new Date(req.body.submissionDate),
          grades: [gradeByAdvisor]
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

export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find();
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        const project = await Project.findById(submission.project);
        return {
          ...submission._doc,
          projectName: project ? project.title : null,
          gradesDetailed: await Promise.all(
            submission.grades.map(async (grade, index) => {
              const gradeInfo = await Grade.findById(grade);
              const judge = await User.findById(gradeInfo.judge);
              return {
                key: submission._id,
                judge: gradeInfo ? gradeInfo.judge : null,
                judgeName: judge ? judge.name : null,
                grade: gradeInfo ? gradeInfo.grade : null,
                comment: gradeInfo ? gradeInfo.comment : null
              };
            })
          ),
          key: submission._id
        };
      })
    );
    res.status(200).json(submissionsWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
