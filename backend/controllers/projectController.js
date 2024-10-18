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
