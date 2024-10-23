import mongoose from "mongoose";
import Project from "../models/projects.js";
import User from "../models/users.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAvailableProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isTerminated: false, isFinished: false, isApproved: true });
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

export const createProject = async (req, res) => {
  try {
    const { title, description, year, suitableFor, type, continues, isApproved, advisors, students } = req.body;

    if (!title || !description || !year || !suitableFor || !type) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    const project = await Project.findOne({ title, year });
    if (project) {
      return res.status(400).send({ message: "This Project already exists in that year" });
    }

    let newProject;
    if (req.user.isAdvisor && !req.user.isCoordinator) {
      newProject = new Project({
        ...req.body,
        advisors: [req.user._id],
        continues,
        isApproved,
        isFinished: false,
        isTerminated: false,
        isTaken: false,
        grades: [],
      });
    } else {
      const advisorsList = [];
      if (advisors.length > 0) {
        for (const adv of advisors) {
          const advisorUser = await User.findOne({ _id: adv, isAdvisor: true });
          if (!advisorUser) {
            return res.status(505).send({ message: `Advisor ${adv.name} not found` });
          }
          advisorsList.push(advisorUser);
        }
      }
      const studentsList = [];
      if (students.length > 0) {
        for (const stud of students) {
          const studentUser = await User.findOne({ id: stud.id, isStudent: true });
          if (!studentUser) {
            return res.status(505).send({ message: `Student ${stud.name} not found` });
          }
          studentsList.push(studentUser);
        }
      }
      newProject = new Project({
        ...req.body,
        advisors: advisorsList,
        students: studentsList,
        continues,
        isApproved,
        isFinished: false,
        isTerminated: false,
        isTaken: false,
        grades: [],
      });
    }

    const savedProject = await newProject.save();

    // Update selectedProject for all assigned students
    if (savedProject.students?.length > 0) {
      await User.updateMany({ _id: { $in: savedProject.students } }, { $set: { selectedProject: savedProject } });
    }

    res.status(201).send("Projected Created Successfully");
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

export const addCandidateToProject = async (req, res) => {
  const userid = req.user._id;
  try {
    const user = await User.findById(userid);
    console.log(req.body);
    const project = await Project.findById(req.body.projectID);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    console.log("here??");
    console.log(project);
    if (project.isTaken) {
      return res.status(400).send({ message: "Project is already taken" });
    }
    if (project.candidates.find((candidate) => candidate.student.toString() === userid.toString())) {
      return res.status(400).send({ message: "You are already a candidate for this project" });
    }
    project.candidates.push({ student: user });
    await project.save();
    console.log("Candidate added successfully");
    res.status(201).send("Candidate added successfully");
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

export const updateProject = async (req, res) => {};

export const deleteProject = async (req, res) => {};

export const addStudentToProject = async (req, res) => {};

export const removeStudentFromProject = async (req, res) => {};

export const closeProject = async (req, res) => {};

export const addAdvisorToProject = async (req, res) => {};

export const getProjectsStatus = async (req, res) => {
  try {
    const projects = await Project.find();
    const numOfTakenProjects = projects.filter((project) => project.isTaken).length;
    const numOfOpenProjects = projects.filter((project) => !project.isTaken).length;
    const numOfFinishedProjects = projects.filter((project) => project.isFinished).length;
    res.status(200).send({ numOfOpenProjects, numOfTakenProjects, numOfFinishedProjects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
