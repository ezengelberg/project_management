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

export const createProject = async (req, res) => {
  try {
    console.log("createProject");
    const { title, description, year, suitableFor, type, continues, isApproved, advisors, students } = req.body;

    if (!title || !description || !year || !suitableFor || !type) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    if (type !== "research" && type !== "development" && type !== "hitech" && type !== "other") {
      return res.status(400).send({ message: "Invalid project type" });
    }
    const project = await Project.findOne({ title, year });
    if (project) {
      return res.status(400).send({ message: "This Project already exists in that year" });
    }

    let newProject;
    if (req.user.isAdvisor && !req.user.isCoordinator) {
      newProject = new Project({
        title,
        description,
        year,
        suitableFor,
        type,
        advisors: [req.user._id],
        students: [],
        continues,
        isApproved,
        isFinished: false,
        isTerminated: false,
        isTaken: false,
        grades: [],
      });
    } else {
      const advisorsList = [];
      for (const adv of advisors) {
        const advisorUser = await User.findOne({ _id: adv._id, isAdvisor: true });
        if (!advisorUser) {
          return res.status(505).send({ message: `Advisor ${adv.name} not found` });
        }
        advisorsList.push(advisorUser);
      }
      const studentsList = [];
      if (students.length > 0) {
        for (const stud of students) {
          const studentUser = await User.findOne({ _id: stud._id, isStudent: true });
          if (!studentUser) {
            return res.status(505).send({ message: `Student ${stud.name} not found` });
          }
          studentsList.push(studentUser);
        }
      }
      console.log(studentsList);
      newProject = new Project({
        title,
        description,
        year,
        suitableFor,
        type,
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
    await newProject.save();
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

export const updateProject = async (req, res) => {};

export const deleteProject = async (req, res) => {};

export const addStudentToProject = async (req, res) => {};

export const removeStudentFromProject = async (req, res) => {};

export const closeProject = async (req, res) => {};

export const addAdvisorToProject = async (req, res) => {};

export const getProjectsStatus = async (req, res) => {
  try {
    const projects = await Project.find();
    const numOfOpenProjects = projects.filter((project) => project.isTaken).length;
    const numOfTakenProjects = projects.filter((project) => !project.isAvailable).length;
    const numOfFinishedProjects = projects.filter((project) => project.isFinished).length;
    res.status(200).send({ numOfOpenProjects, numOfTakenProjects, numOfFinishedProjects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
