import User from "../models/users.js";
import Project from "../models/projects.js";
import bcrypt from "bcrypt";
import passport from "passport";
import mongoose from "mongoose";

export const registerUser = async (req, res) => {
  try {
    const { name, email, id, password, confirmPassword, isStudent, isAdvisor, isCoordinator } = req.body;
    const userByEmail = await User.findOne({ email: email });
    if (userByEmail) {
      return res.status(400).send("Email already in use");
    }

    const userById = await User.findOne({ id: id });
    if (userById) {
      return res.status(400).send("ID already in use");
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      id,
      password: hashedPassword,
      // isStudent: true, // set default for now
      isAdvisor: false, // set default for now
      isCoordinator: false // set default for now
    });
    await newUser.save();
    console.log(`User ${name} registered successfully`);
    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send(info.message); // Send error from strategy

    req.login(user, (err) => {
      if (err) return next(err);
      console.log("Login successful");
      res.status(200).send("Login successful");
    });
  })(req, res, next);
};

export const logoutUser = (req, res, next) => {
  if (!req.session) {
    return res.status(400).json({ message: "No active session found" });
  }

  const sessionId = req.session.id;
  console.log("Current session ID:", sessionId);

  // Logout the user (removes the user from the session)
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }

    // console.log
    // Destroy the session in the store
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Error destroying session" });
      }

      res.status(200).clearCookie("connect.sid", { path: "/" }).json({ status: "Success" });
    });
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    users.forEach((user) => {
      delete user.password;
    });
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getUsersNoProjects = async (req, res) => {
  try {
    const users = await User.find();
    const usersNoProjects = [];

    for (const user of users) {
      const projects = await Project.find({ students: user._id });
      if (projects.length === 0) {
        delete user.password;
        usersNoProjects.push(user);
      }
    }

    res.status(200).send(usersNoProjects);
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getPrivileges = async (req, res) => {
  const user = req.user;
  res.status(200).json({ isStudent: user.isStudent, isAdvisor: user.isAdvisor, isCoordinator: user.isCoordinator });
};

export const getUserName = async (req, res) => {
  const user = req.user;
  res.status(200).json({ name: user.name });
};

export const toggleFavoriteProject = async (req, res) => {
  const user = req.user;
  const { projectId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(500).send("Invalid project ID");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).send("Project not found");
  }

  // Ensure the user has a favorites array
  if (!user.favorites) {
    user.favorites = [];
  }

  const userFavorites = user.favorites;
  const projectIndex = userFavorites.findIndex((fav) => fav._id.toString() === project._id.toString());
  if (projectIndex === -1) {
    // Push the whole project object if not present
    userFavorites.push(project);
    res.status(200).send("Project added to favorites");
  } else {
    // Remove the project object if already in favorites
    userFavorites.splice(projectIndex, 1);
    res.status(200).send("Project removed from favorites");
  }

  // Save the updated user document
  await user.save();
};

export const ensureFavoriteProject = async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  if (user.favorites.find((fav) => fav.toString() === projectId)) {
    res.status(200).send({favorite: true});
  } else {
    res.status(200).send({favorite: false});
  }
};
