import Project from "../models/projects.js";
import User from "../models/users.js";
import Notification from "../models/notifications.js";
import Submission from "../models/submission.js";
import Grade from "../models/grades.js";
import Upload from "../models/uploads.js";
import Config from "../models/config.js";
import fs from "fs";
import path from "path";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getActiveProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isTerminated: false, isFinished: false });
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAvailableProjects = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).send({ message: "Config not found" });
    }
    const projects = await Project.find({ isTerminated: false, isFinished: false, year: config.currentYear });
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getProjectsByYear = async (req, res) => {
  try {
    const projects = await Project.find({ year: req.params.year });
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    const projectObj = project.toObject(); // Convert to plain JavaScript object
    delete projectObj.grades;
    delete projectObj.students;
    res.status(200).send(projectObj);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getSelfProjects = async (req, res) => {
  try {
    const userid = req.user._id;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(200).send({ projects: [] });
    }
    const projects = await Project.find({ advisors: { $in: [user] } });
    res.status(200).send({ projects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, year, suitableFor, type, continues, advisors, students } = req.body;

    if (!title || !description || !year || !suitableFor || !type) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    const project = await Project.findOne({ title, year });
    if (project) {
      return res.status(400).send({ message: "This Project already exists in that year" });
    }

    let newProject;
    const advisorsList = [];
    const studentsList = [];
    if (req.user.isAdvisor && !req.user.isCoordinator) {
      newProject = new Project({
        ...req.body,
        advisors: [req.user._id],
        continues,
        isFinished: false,
        isTerminated: false,
        isTaken: false,
        grades: [],
      });
    } else {
      if (advisors.length > 0) {
        for (const adv of advisors) {
          const advisorUser = await User.findOne({ _id: adv, isAdvisor: true });
          if (!advisorUser) {
            return res.status(505).send({ message: `Advisor ${adv.name} not found` });
          }
          advisorsList.push(advisorUser);
        }
      }
      if (students.length > 0) {
        for (const stud of students) {
          const studentUser = await User.findOne({ id: stud.id, isStudent: true });
          if (!studentUser) {
            return res.status(505).send({ message: `Student ${stud.name} not found` });
          }
          studentsList.push({ student: studentUser });
        }
      }
      newProject = new Project({
        ...req.body,
        advisors: advisorsList,
        students: studentsList,
        continues,
        isFinished: false,
        isTerminated: false,
        isTaken: false,
        grades: [],
      });
    }

    if (newProject.students.length > 0 && newProject.advisors.length > 0) {
      newProject.isTaken = true;
    }

    const savedProject = await newProject.save();

    Promise.all(
      advisorsList.map(async (advisor) => {
        const notification = new Notification({
          user: advisor._id,
          message: `התווספת כמנחה לפרויקט: ${title}`,
          link: `/project/${savedProject._id}`,
        });
        notification.save();
      }),

      studentsList.map(async (student) => {
        const notification = new Notification({
          user: student.student,
          message: `התווספת כסטודנט לפרויקט: ${title}`,
          link: `/project/${savedProject._id}`,
        });
        notification.save();
      })
    );

    res.status(201).json({
      message: "Project created successfully",
      project: savedProject,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getProjectsNoAdvisor = async (req, res) => {
  try {
    const projects = await Project.find({ advisors: [] });
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getProjectsNoStudent = async (req, res) => {
  try {
    const projects = await Project.find({ students: [] });
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addStudentToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    for (const student of req.body.students) {
      const user = await User.findById(student);
      if (!user) {
        return res.status(404).send({ message: "Student not found" });
      }
      if (project.students.find((student) => student.student.toString() === user._id.toString())) {
        return res.status(400).send({ message: "Student is already in this project" });
      }
      project.students.push({ student: user._id });
      const notification = new Notification({
        user: user._id,
        message: `התווספת כסטודנט לפרויקט: ${project.title}`,
        link: `/project/${project._id}`,
      });
      notification.save();
    }

    if (project.students.length > 0 && project.advisors.length > 0) {
      project.isTaken = true;
    }

    await project.save();
    res.status(200).send("Student added successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateStudentsInProject = async (req, res) => {
  try {
    const { projectID, students } = req.body;
    const project = await Project.findById(projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    // Validate students
    const validStudents = [];
    for (const studentID of students) {
      const student = await User.findById(studentID);
      if (!student || !student.isStudent) {
        return res.status(400).send({ message: `Invalid student ID: ${studentID}` });
      }
      validStudents.push({ student: student._id });
    }

    project.students = validStudents;

    if (project.students.length === 0) {
      project.isTaken = false;
    }

    await project.save();
    res.status(200).send({ message: "Students updated successfully", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addCandidateToProject = async (req, res) => {
  const userid = req.user._id;
  try {
    const user = await User.findById(userid);
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    if (project.isTaken) {
      return res.status(400).send({ error: "Project is already taken", message: "הפרויקט כבר נלקח" });
    }
    if (project.candidates.find((candidate) => candidate.student.toString() === userid.toString())) {
      return res.status(400).send({ message: "You are already a candidate for this project" });
    }
    project.candidates.push({ student: user._id });
    await project.save();

    const notification = new Notification({
      user: user._id,
      message: `התווספת כמתמודד לפרויקט: ${project.title} שים לב כי עליך לקבל אישור מהמנחה של הפרויקט`,
      link: `/project/${project._id}`,
    });
    notification.save();

    res.status(201).send("Candidate added successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const removeCandidateFromProject = async (req, res) => {
  const userid = req.body.userID;
  try {
    const user = await User.findById(userid);
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    if (!project.candidates.find((candidate) => candidate.student.toString() === userid.toString())) {
      return res.status(400).send({ message: "You are not a candidate for this project" });
    }
    project.candidates = project.candidates.filter((candidate) => candidate.student.toString() !== userid.toString());
    await project.save();

    const notification = new Notification({
      user: user._id,
      message: `הוסרת מהמועמדים לפרויקט ${project.title}`,
      link: `/project/${project._id}`,
    });
    notification.save();

    res.status(200).send("Candidate removed successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const approveCandidate = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    const user = await User.findById(req.body.userID);
    const candidate = project.candidates.find((candidate) => candidate.student.toString() === user._id.toString());
    if (candidate) {
      if (!project.students) {
        project.students = [];
      }
      if (project.students.find((candidate) => candidate.student.toString() === user._id.toString())) {
        return res.status(409).send({ error: "Candidate is already approved", message: "המועמד כבר אושר" });
      }

      const projectResult = await Project.findOne({ students: { $elemMatch: { student: user._id } } });
      if (projectResult) {
        return res
          .status(409)
          .send({ error: "Student is already in another project", message: "הסטודנט כבר נמצא בפרויקט אחר" });
      }
      if (project.students.length >= 2) {
        return res
          .status(409)
          .send({ error: "Project is already full", message: "הפרויקט כבר מלא - רשומים שני סטודנטים" });
      }
      const { _id, ...candidateWithoutId } = candidate.toObject();
      project.students.push(candidateWithoutId);
      project.candidates = project.candidates.filter(
        (candidate) => candidate.student.toString() !== user._id.toString()
      );
    }
    await project.save();

    const notification = new Notification({
      user: user._id,
      message: `התקבלת כסטודנט לפרויקט ${project.title}, בהצלחה!`,
      link: `/project/${project._id}`,
    });
    notification.save();

    res.status(200).send(`Candidate ${candidate.student} approved successfully`);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const removeStudentFromProject = async (req, res) => {
  try {
    const userid = req.body.userID;
    const user = await User.findById(userid);
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    if (!project.students.find((student) => student.student.toString() === userid.toString())) {
      return res.status(400).send({ message: "User is not a student in this project" });
    }
    const student = project.students.find((student) => student.student.toString() === userid.toString());
    project.students = project.students.filter((student) => student.student.toString() !== userid.toString());
    project.candidates.push(student);
    await project.save();

    const notification = new Notification({
      user: user._id,
      message: `הוסרת מהסטודנטים של פרויקט ${project.title}`,
      link: `/project/${project._id}`,
    });
    notification.save();
    res.status(200).send("Student moved back to candidates successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const switchProjectRegistration = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    const submission = await Submission.findOne({ project: project._id });
    if (submission) {
      return res
        .status(200)
        .send({ message: "Project has a submission, cannot switch registration", hasSubmission: true });
    }
    project.isTaken = !project.isTaken;
    await project.save();
    res.status(200).send("Project registration switched successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const checkIfUserIsCandidate = async (req, res) => {
  const userid = req.user._id;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    if (project.candidates.find((candidate) => candidate.student.toString() === userid.toString())) {
      return res.status(200).send({ isCandidate: true });
    }
    res.status(200).send({ isCandidate: false });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const { title, description, year, suitableFor, type, externalEmail, continues } = req.body;
    if (!title || !description || !year || !suitableFor || !type) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const updatedFields = {
      oldTitle: project.title,
      newTitle: title !== project.title ? title : "שדה לא שונה",
      oldDescription: project.description,
      newDescription: description !== project.description ? description : "שדה לא שונה",
      oldYear: project.year,
      newYear: year !== project.year ? year : "שדה לא שונה",
      oldSuitableFor: project.suitableFor,
      newSuitableFor: suitableFor !== project.suitableFor ? suitableFor : "שדה לא שונה",
      oldType: project.type,
      newType: type !== project.type ? type : "שדה לא שונה",
      oldExternalEmail: project.externalEmail ? project.externalEmail : "לא הוזן",
      newExternalEmail: externalEmail !== project.externalEmail ? externalEmail : "שדה לא שונה",
      oldContinues: project.continues ? "כן" : "לא",
      newContinues: continues !== project.continues ? (continues ? "כן" : "לא") : "שדה לא שונה",
      editDate: new Date(),
      editedBy: { name: user.name, id: user.id },
    };

    project.editRecord.push(updatedFields);

    project.title = title;
    project.description = description;
    project.year = year;
    project.suitableFor = suitableFor;
    project.type = type;
    project.externalEmail = externalEmail;
    project.continues = continues;

    await project.save();
    res.status(201).json({
      message: "Project updated successfully",
      project: project,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addAdvisorToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    const advisor = await User.findById(req.body.advisorID);
    if (!advisor) {
      return res.status(404).send({ message: "Advisor not found" });
    }
    if (!project.advisors.find((advisor) => advisor.toString() === req.body.advisorID)) {
      project.advisors.push(req.body.advisorID);
    }
    if (project.students.length !== 0) {
      project.isTaken = true;
    }
    await project.save();

    const notification = new Notification({
      user: req.body.advisorID,
      message: `התווספת כמנחה לפרויקט: ${project.title}`,
      link: `/project/${project._id}`,
    });
    notification.save();

    res.status(200).send("Advisor added successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateAdvisorInProject = async (req, res) => {
  try {
    const { projectID, advisorID } = req.body;
    const project = await Project.findById(projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    const advisor = await User.findById(advisorID);
    if (!advisor || !advisor.isAdvisor) {
      return res.status(400).send({ message: "Invalid advisor ID" });
    }

    const currentAdvisor = project.advisors[0];
    if (currentAdvisor !== advisorID) {
      const notification = new Notification({
        user: currentAdvisor,
        message: `הוסרת כמנחה של פרויקט: ${project.title}`,
        link: `/project/${project._id}`,
      });
      notification.save();
    }

    project.advisors = [advisorID];

    if (project.advisors.length === 0) {
      project.isTaken = false;
    }

    const notification = new Notification({
      user: advisorID,
      message: `התווספת כמנחה לפרויקט: ${project.title}`,
      link: `/project/${project._id}`,
    });
    notification.save();

    await project.save();

    res.status(200).send({ message: "Advisor updated successfully", project });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const terminateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    await Promise.all([
      ...project.students.map(async (student) => {
        const notification = new Notification({
          user: student.student,
          message: `הפרויקט: ${project.title} בו אתה רשום בוטל`,
          link: `/project/${project._id}`,
        });
        await notification.save();
      }),
      ...project.advisors.map(async (advisor) => {
        const notification = new Notification({
          user: advisor,
          message: `הפרויקט: ${project.title} שאתה מנחה בוטל`,
          link: `/project/${project._id}`,
        });
        await notification.save();
      }),
    ]);

    // Save students to termination Record and free them from the project
    project.terminationRecord = project.students;
    project.students = [];
    project.alphaReportJudges = [];
    project.finalReportJudges = [];
    project.examJudges = [];
    project.isTerminated = true;

    // Delete all related submissions and their files
    const submissions = await Submission.find({ project: project._id });
    for (const submission of submissions) {
      if (submission.file) {
        const file = await Upload.findById(submission.file);
        if (file) {
          const filePath = path.join(process.cwd(), `uploads/${file.destination}`, file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          await Upload.deleteOne({ _id: submission.file });
        }
      }
      // Delete all grades related to the submission
      await Grade.deleteMany({ _id: { $in: submission.grades } });
      await submission.deleteOne();
    }

    await project.save();
    res.status(200).send("Project terminated successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    await project.deleteOne();
    res.status(200).send("Project deleted successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const restoreProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    if (!project.isTerminated) {
      return res.status(400).send({ message: "Project is not terminated" });
    }
    project.isTerminated = false;
    project.terminationRecord = [];
    project.isTaken = false;
    project.isFinished = false;
    project.students = [];
    project.alphaReportJudges = [];
    project.finalReportJudges = [];
    project.examJudges = [];
    project.candidates = [];
    project.grades = [];

    await project.save();
    res.status(200).send("Project restored successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const assignAdvisorsAutomatically = async (req, res) => {
  try {
    const projects = await Project.find({ advisors: [] });
    const advisors = await User.find({ isAdvisor: true });

    if (projects.length === 0) {
      return res.status(304).send({ message: "All projects already have advisors" });
    }

    // Create a map to store advisor project counts and ranks
    const advisorStats = new Map();

    // Initialize advisor stats
    advisors.forEach((advisor) => {
      advisorStats.set(advisor._id.toString(), { count: 0, rank: 0 });
    });

    // Calculate current project counts and ranks for each advisor
    const allProjects = await Project.find({ advisors: { $ne: [] } });
    allProjects.forEach((project) => {
      project.advisors.forEach((advisorId) => {
        const stats = advisorStats.get(advisorId.toString());
        if (stats) {
          stats.count += 1;
          if (project.suitableFor === "יחיד") {
            stats.rank += 1;
          } else if (project.suitableFor === "יחיד/זוג") {
            stats.rank += 2;
          } else if (project.suitableFor === "זוג") {
            stats.rank += 3;
          }
        }
      });
    });

    // Sort advisors by a weighted combination of project count and rank
    const sortedAdvisors = Array.from(advisorStats.entries()).sort((a, b) => {
      const aTotal = a[1].count * 1.5 + a[1].rank;
      const bTotal = b[1].count * 1.5 + b[1].rank;
      return aTotal - bTotal;
    });

    // Assign advisors to projects
    for (const project of projects) {
      if (project.advisors.length === 0) {
        const advisorId = sortedAdvisors.shift()[0];
        project.advisors.push(advisorId);
        const stats = advisorStats.get(advisorId);
        stats.count += 1;
        if (project.suitableFor === "יחיד") {
          stats.rank += 1;
        } else if (project.suitableFor === "יחיד/זוג") {
          stats.rank += 2;
        } else if (project.suitableFor === "זוג") {
          stats.rank += 3;
        }
        sortedAdvisors.push([advisorId, stats]);
        sortedAdvisors.sort((a, b) => {
          const aTotal = a[1].count * 1.5 + a[1].rank;
          const bTotal = b[1].count * 1.5 + b[1].rank;
          return aTotal - bTotal;
        });
      }
    }

    await Promise.all(projects.map((project) => project.save()));
    res.status(200).send("Advisors assigned successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getProjectYears = async (req, res) => {
  try {
    const years = await Project.distinct("year");
    res.status(200).send(years);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const startProjectsCoordinator = async (req, res) => {
  try {
    const projects = await Project.find({ year: req.body.year, isTaken: false });
    if (projects.length === 0) {
      return res.status(304).send({ message: "No projects found" });
    }
    projects.forEach((project) => {
      if (project.advisors.length !== 0 && project.students.length !== 0 && !project.isTaken) {
        project.isTaken = true;
      }
    });
    await Promise.all(projects.map((project) => project.save()));
    res.status(200).send("Projects started successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    for (const project of projects) {
      // Detach students and advisors
      project.students = [];
      project.advisors = [];
      await project.save();

      // Delete associated submissions
      const submissions = await Submission.find({ project: project._id });
      for (const submission of submissions) {
        // Delete associated grades
        await Grade.deleteMany({ _id: { $in: submission.grades } });

        // Delete associated file
        if (submission.file) {
          const file = await Upload.findById(submission.file);
          if (file) {
            const filePath = path.join(process.cwd(), `uploads/${file.destination}`, file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            await Upload.deleteOne({ _id: submission.file });
          }
        }
      }
      await Submission.deleteMany({ project: project._id });
    }
    await Project.deleteMany();
    res.status(200).json({ message: "All projects deleted successfully" });
  } catch (error) {
    console.error("Error deleting projects:", error);
    res.status(500).json({ message: "Failed to delete projects" });
  }
};
