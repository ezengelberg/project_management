import Project from "../models/projects.js";
import Submission from "../models/submission.js";
import User from "../models/users.js";
import Grade from "../models/grades.js";

export const createSubmission = async (req, res) => {
  console.log("Creating submission");
  console.log(req.body);
  try {
    const projects = await Project.find({ isTerminated: false, isFinished: false, isTaken: true });
    await Promise.all(
      projects.map(async (project) => {
        let newGrade;
        let gradeByAdvisor;
        const checkExist = await Submission.find({ project: project._id, name: req.body.name });
        if (checkExist.length > 0) {
          return; // Skip this project if submission already exists
        }
        if (project.advisors.length > 0) {
          newGrade = new Grade({ judge: project.advisors[0]._id });
          gradeByAdvisor = await newGrade.save();
        }
        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          submissionDate: new Date(req.body.submissionDate),
          grades: [gradeByAdvisor],
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
          grades: [gradeByAdvisor],
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
    const activeProjects = await Project.find({ isTerminated: false, isFinished: false, isTaken: true });
    const activeProjectIds = activeProjects.map((project) => project._id);

    const submissions = await Submission.find({ project: { $in: activeProjectIds } });
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        const project = await Project.findById(submission.project);
        return {
          ...submission._doc,
          projectName: project ? project.title : null,
          gradesDetailed: await Promise.all(
            submission.grades.map(async (grade) => {
              const gradeInfo = await Grade.findById(grade);
              const judge = await User.findById(gradeInfo.judge);
              return {
                key: gradeInfo ? gradeInfo._id : null,
                judge: gradeInfo ? gradeInfo.judge : null,
                judgeName: judge ? judge.name : null,
                grade: gradeInfo ? gradeInfo.grade : null,
                comment: gradeInfo ? gradeInfo.comment : null,
                overridden: gradeInfo ? gradeInfo.overridden : null,
              };
            })
          ),
          key: submission._id,
        };
      })
    );
    res.status(200).json(submissionsWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const copyJudges = async (req, res) => {
  try {
    const activeProjects = await Project.find({ isTerminated: false, isFinished: false, isTaken: true });
    const activeProjectIds = activeProjects.map((project) => project._id);
    const submissions = await Submission.find({ project: { $in: activeProjectIds }, name: req.body.sourceSubmission });
    await Promise.all(
      submissions.map(async (submission) => {
        const project = await Project.findById(submission.project);
        const newGrades = await Promise.all(
          project.advisors.map(async (advisor) => {
            const newGrade = new Grade({ judge: advisor });
            return await newGrade.save();
          })
        );
        submission.grades = newGrades;
        await submission.save();
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateJudgesInSubmission = async (req, res) => {
  try {
    const { submissionID, judges } = req.body;
    const submission = await Submission.findById(submissionID).populate("grades");
    if (!submission) {
      return res.status(404).send({ message: "Submission not found" });
    }

    // Validate judges
    const validateJudges = async (judges) => {
      const validJudges = [];
      for (const judgeID of judges) {
        const judge = await User.findById(judgeID);
        if (!judge || !judge.isJudge) {
          throw new Error(`Invalid judge ID: ${judgeID}`);
        }
        validJudges.push(judgeID);
      }
      return validJudges;
    };

    const validJudges = await validateJudges(judges);

    // Find judges to remove
    const judgesToRemove = submission.grades.filter((grade) => !validJudges.includes(grade.judge.toString()));

    // Remove grades associated with judges to remove
    if (judgesToRemove.length !== 0) {
      await Promise.all(
        judgesToRemove.map(async (grade) => {
          await Grade.findByIdAndDelete(grade._id);
        })
      );
    }

    // Filter out removed grades from submission
    submission.grades = submission.grades.filter((grade) => !judgesToRemove.includes(grade));

    // Find new judges to add
    const newJudges = validJudges.filter(
      (judgeID) => !submission.grades.some((grade) => grade.judge && grade.judge.toString() === judgeID)
    );

    if (newJudges.length !== 0) {
      // Add new grades for new judges
      const newGrades = await Promise.all(
        newJudges.map(async (judgeID) => {
          const newGrade = new Grade({ judge: judgeID });
          await newGrade.save();
          return newGrade._id;
        })
      );
      submission.grades = [...submission.grades, ...newGrades];
    }

    await submission.save();
    res.status(200).send({ message: "Judges updated successfully", submission });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
