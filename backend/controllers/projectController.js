import Project from "../models/projects.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
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
    const projectId = req.body.id;
    if (await Project.exists({ id: projectId })) {
      return res.status(400).send({ message: "Project already exists" });
    }
    const project = new Project(req.body);
    await project.save();
    res.status(201).send(project);
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
    const numOfOpenProjects = projects.filter((project) => project.isAvailable).length;
    const numOfTakenProjects = projects.filter((project) => !project.isAvailable).length;
    const numOfFinishedProjects = projects.filter((project) => project.isFinished).length;
    res.status(200).send({ numOfOpenProjects, numOfTakenProjects, numOfFinishedProjects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
