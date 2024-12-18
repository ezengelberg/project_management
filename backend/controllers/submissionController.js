import Project from "../models/projects.js";
import Submission from "../models/submission.js";
import User from "../models/users.js";
import Grade from "../models/grades.js";
import Upload from "../models/uploads.js";
import Notification from "../models/notifications.js";
import fs from "fs";
import path from "path";

export const createSubmission = async (req, res) => {
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

        const user = await User.findById(project.advisors[0]._id);
        user.isJudge = true;
        await user.save();

        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          submissionDate: new Date(req.body.submissionDate),
          grades: [gradeByAdvisor],
          isGraded: req.body.isGraded,
          isReviewed: req.body.isReviewed,
          submissionInfo: req.body.submissionInfo,
        });
        await submission.save();

        // Create notifications for students
        await Promise.all(
          project.students.map(async (student) => {
            const notification = new Notification({
              user: student.student,
              message: `נוצרה הגשה חדשה: ${req.body.name}`,
              link: "/my-submissions",
            });
            await notification.save();
          })
        );
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
    console.log("Creating specific submissions");
    await Promise.all(
      req.body.projects.map(async (projectId) => {
        const project = await Project.findById(projectId);

        let newGrade;
        let gradeByAdvisor;
        if (project.advisors.length > 0) {
          newGrade = new Grade({ judge: project.advisors[0]._id });
          gradeByAdvisor = await newGrade.save();
        }

        const user = await User.findById(project.advisors[0]._id);
        user.isJudge = true;
        await user.save();

        const submission = new Submission({
          name: req.body.name,
          project: project._id,
          submissionDate: new Date(req.body.submissionDate),
          grades: [gradeByAdvisor],
        });
        await submission.save();

        // Create notifications for students
        await Promise.all(
          project.students.map(async (student) => {
            const notification = new Notification({
              user: student.student,
              message: `נוצרה הגשה חדשה: ${req.body.name}`,
              link: "/my-submissions",
            });
            await notification.save();
          })
        );
      })
    );
    console.log("Submissions created successfully");
    res.status(201).json({ message: "Submissions created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProjectSubmissions = async (req, res) => {
  try {
    const activeProjects = await Project.find({ isTerminated: false, isFinished: false, isTaken: true });
    const projectsList = await Promise.all(
      activeProjects.map(async (project) => {
        const submissions = await Submission.find({ project: project._id });
        const submissionsWithGrades = await Promise.all(
          submissions.map(async (submission) => {
            const grades = await Promise.all(
              submission.grades.map(async (gradeId) => {
                const grade = await Grade.findById(gradeId);
                const judge = await User.findById(grade.judge);
                return {
                  key: grade._id,
                  gradeid: grade._id,
                  judge: grade.judge,
                  judgeName: judge ? judge.name : null,
                  grade: grade.grade,
                  videoQuality: grade.videoQuality,
                  workQuality: grade.workQuality,
                  writingQuality: grade.writingQuality,
                  journalActive: grade.journalActive,
                  commits: grade.commits,
                };
              })
            );
            return {
              key: submission._id,
              submissionid: submission._id,
              name: submission.name,
              submissionDate: submission.submissionDate,
              uploadDate: submission.uploadDate,
              grades: grades,
              submitted: submission.file ? true : false,
              isGraded: submission.isGraded,
              isReviewed: submission.isReviewed,
              overridden: submission.overridden,
              finalGrade: submission.finalGrade,
              file: submission.file,
            };
          })
        );
        return {
          key: project._id,
          projectid: project._id,
          title: project.title,
          year: project.year,
          submissions: submissionsWithGrades,
        };
      })
    );

    let resolvedProjectsList = await Promise.all(projectsList);
    resolvedProjectsList = resolvedProjectsList.map((project) => {
      project.submissions = project.submissions.sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));
      return project;
    });

    res.status(200).json(resolvedProjectsList.filter((project) => project.submissions.length > 0));
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
                numericGrade: gradeInfo ? gradeInfo.numericGrade : null,
                videoQuality: gradeInfo ? gradeInfo.videoQuality : null,
                editable: gradeInfo ? gradeInfo.editable : null,
                overridden: submission.overridden,
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

export const getStudentSubmissions = async (req, res) => {
  try {
    const project = await Project.findOne({ students: { $elemMatch: { student: req.user._id } } });
    if (!project) {
      return res.status(200).json({ message: "No project found" });
    }
    const submissions = await Submission.find({ project: project._id });
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => ({
        ...submission._doc,
        key: submission._id,
        project: submission.project,
        submissionName: submission.name,
        submissionDate: submission.submissionDate,
        file: submission.file,
        grades: await Promise.all(
          submission.grades.map(async (gradeId) => {
            const grade = await Grade.findById(gradeId);
            return {
              videoQuality: grade.videoQuality,
              workQuality: grade.workQuality,
              writingQuality: grade.writingQuality,
              journalActive: grade.journalActive,
              commits: grade.commits,
            };
          })
        ),
      }))
    ).then((result) => result.sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate)));

    res.status(200).json(submissionsWithDetails);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getJudgeSubmissions = async (req, res) => {
  try {
    // First find all grades where the user is the judge
    const submissions = await Submission.find()
      .populate({
        path: "grades",
        match: { judge: req.user._id },
        populate: {
          path: "judge",
          select: "name email",
        },
      })
      .populate("project", "title description")
      .exec();

    // Filter submissions to only include ones where the user has grades
    const filteredSubmissions = submissions.filter((submission) => submission.grades && submission.grades.length > 0);

    // Map to the required format
    const submissionsWithDetails = filteredSubmissions.map((submission) => ({
      key: submission._id,
      projectName: submission.project ? submission.project.title : null,
      submissionName: submission.name,
      submissionDate: submission.submissionDate,
      grade: submission.grades[0]?.grade || null,
      comment: submission.grades[0]?.comment || "",
      videoQuality: submission.grades[0]?.videoQuality || null,
      projectId: submission.project ? submission.project._id : null,
      editable: submission.grades[0]?.editable,
      isGraded: submission.isGraded,
      isReviewed: submission.isReviewed,
      submitted: submission.file ? true : false,
      file: submission.file,
    }));

    res.status(200).json(submissionsWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("project", "title advisors")
      .populate({
        path: "grades",
        match: { judge: req.user._id },
        populate: {
          path: "judge",
          select: "name email",
        },
      })
      .exec();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const submissionData = {
      projectId: submission.project._id,
      projectName: submission.project.title,
      advisorId: submission.project.advisors[0]._id,
      submissionName: submission.name,
      submissionDate: submission.submissionDate,
      existingGrade: (submission.isGraded && submission.grades[0]?.grade) || null,
      existingVideoQuality: submission.grades[0]?.videoQuality || "",
      existingWorkQuality: submission.grades[0]?.workQuality || "",
      existingWritingQuality: submission.grades[0]?.writingQuality || "",
      existingJournalActive: submission.grades[0]?.journalActive || "",
      existingCommits: submission.grades[0]?.commits || "",
      isReviewed: submission.isReviewed,
      isGraded: submission.isGraded,
    };

    res.status(200).json(submissionData);
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
    const submission = await Submission.findById(submissionID).populate("project").populate("grades");
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
          const notification = new Notification({
            user: grade.judge,
            message: `הוסרת משפיטת: "${submission.name}" עבור פרויקט: "${submission.project.title}"`,
          });
          await notification.save();
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
          const notification = new Notification({
            user: judgeID,
            message: `מונתה לשפיטת: "${submission.name}" עבור פרויקט: "${submission.project.title}"`,
          });
          await notification.save();
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

export const updateSubmissionFile = async (req, res) => {
  try {
    console.log("updating sub");
    const submission = await Submission.findById(req.params.id).populate("project");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    Object.keys(req.body).forEach((key) => {
      submission[key] = req.body[key];
    });
    submission.uploadDate = new Date();
    submission.uploadedBy = req.user._id;

    await submission.save();

    // Create notifications for students
    await Promise.all(
      submission.project.students.map(async (student) => {
        const notification = new Notification({
          user: student.student,
          message: req.body.sentFromDelete
            ? `קובץ נמחק עבור "${submission.name}" ע"י ${req.user.name}`
            : `הועלה קובץ עבור: "${submission.name}" ע"י ${req.user.name}`,
        });
        await notification.save();
      })
    );

    res.status(200).json({ message: "Submission updated successfully", submission });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("project");
    if (!submission) {
      console.log("Submission not found");
      return res.status(404).json({ message: "Submission not found" });
    }
    if (submission.file) {
      const file = await Upload.findById(submission.file);
      if (file) {
        const filePath = path.join(process.cwd(), `uploads/${file.destination}`, file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await Upload.deleteOne({ _id: submission.file });
      }
    }
    await Submission.deleteOne({ _id: submission._id });
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteActiveSubmissions = async (req, res) => {
  console.log("deleting");
  try {
    const activeProjects = await Project.find({ isTerminated: false, isFinished: false, isTaken: true });
    const activeProjectIds = activeProjects.map((project) => project._id);
    const submissionsToDelete = await Submission.find({
      project: { $in: activeProjectIds },
      name: req.body.submissionName,
    });

    await Promise.all(
      submissionsToDelete.map(async (submission) => {
        if (submission.file) {
          const file = await Upload.findById(submission.file);
          if (file) {
            const filePath = path.join(process.cwd(), `uploads/${file.destination}`, file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            console.log("file deleted");
            await Upload.deleteOne({ _id: submission.file });
          }
        }
        await Submission.deleteOne({ _id: submission._id });
      })
    );

    res.status(200).json({ message: "Active submissions deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSubmissionInformation = async (req, res) => {
  try {
    const submissions = await Submission.find({ name: req.body.submissionOldName }).populate("project");
    const activeProjects = await Project.find({ isTerminated: false, isFinished: false, isTaken: true });
    const activeProjectIds = activeProjects.map((project) => project._id.toString()); // Convert ObjectIds to strings

    await Promise.all(
      submissions.map(async (submission) => {
        if (activeProjectIds.includes(submission.project._id.toString())) {
          Object.keys(req.body).forEach((key) => {
            submission[key] = req.body[key];
          });
          submission.name = req.body.SubmissionName;
          await submission.save();
        }
      })
    );

    console.log("Submissions updated successfully");
    res.status(200).json({ message: "Submissions updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSpecificSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("project");
    if (!submission) {
      return res.status(404).json({ message: "הגשה לא נמצאה" });
    } else {
      Object.keys(req.body).forEach((key) => {
        submission[key] = req.body[key];
      });
      await submission.save();
      res.status(200).json({ message: "Submission updated successfully", submission });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSubmissionDetails = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("project", "title")
      .populate({
        path: "grades",
        match: { judge: req.user._id },
        populate: { path: "judge", select: "name email" },
      })
      .exec();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const grade = submission.grades[0];

    const submissionDetails = {
      submissionName: submission.name,
      projectName: submission.project.title,
      judgeName: grade.judge.name,
      grade: grade.grade,
      videoQuality: grade.videoQuality,
      workQuality: grade.workQuality,
      writingQuality: grade.writingQuality,
      journalActive: grade.journalActive,
      commits: grade.commits,
      updatedAt: grade.updatedAt,
      numericValue: grade.numericGrade,
      isGraded: submission.isGraded,
      isReviewed: submission.isReviewed,
      overridden: submission.overridden,
    };

    res.status(200).json(submissionDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSpecificProjectSubmissions = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const submissions = await Submission.find({ project: projectId }).populate("project", "title");
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        const grades = await Promise.all(
          submission.grades.map(async (gradeId) => {
            const grade = await Grade.findById(gradeId);
            const judge = await User.findById(grade.judge);
            return {
              key: grade._id,
              gradeid: grade._id,
              judge: grade.judge,
              judgeName: judge ? judge.name : null,
              grade: grade.grade,
              videoQuality: grade.videoQuality,
              workQuality: grade.workQuality,
              writingQuality: grade.writingQuality,
              journalActive: grade.journalActive,
              commits: grade.commits,
            };
          })
        );
        return {
          key: submission._id,
          submissionid: submission._id,
          name: submission.name,
          submissionDate: submission.submissionDate,
          uploadDate: submission.uploadDate,
          grades: grades,
          submitted: submission.file ? true : false,
          isGraded: submission.isGraded,
          isReviewed: submission.isReviewed,
          overridden: submission.overridden,
          projectName: submission.project.title,
          finalGrade: submission.finalGrade,
          overridden: submission.overridden,
          editable: submission.editable,
          file: submission.file,
        };
      })
    );
    res.status(200).json(submissionsWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
