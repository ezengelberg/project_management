import User from "../models/users.js";
import Project from "../models/projects.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import mongoose from "mongoose";

export const registerUser = async (req, res) => {
  try {
    const { name, email, id, password, isStudent, isAdvisor, isJudge, isCoordinator } = req.body;
    const userByEmail = await User.findOne({ email: email });
    if (userByEmail) {
      return res.status(400).send("Email already in use");
    }

    const userById = await User.findOne({ id: id });
    if (userById) {
      return res.status(400).send("ID already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      ...req.body,
      firstLogin: true,
      password: hashedPassword,
      registerDate: new Date(),
      suspensionRecords: [],
      isStudent: isStudent || false,
      isAdvisor: isAdvisor || false,
      isJudge: isJudge || false,
      isCoordinator: isCoordinator || false,
    });
    await newUser.save();
    console.log(`User ${name} registered successfully`);
    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const registerMultiple = async (req, res) => {
  try {
    console.log("Registering multiple users");
    const users = req.body;
    const existingUsers = [];
    for (const user of users) {
      console.log("printing user");
      const { name, email, id, role } = user;
      delete user.key;
      delete user.role;
      console.log(user);
      const userByEmail = await User.findOne({ email: email });
      if (userByEmail) {
        existingUsers.push(user);
        continue;
      }
      console.log("email not found");
      const userById = await User.findOne({ id: id });
      if (userById) {
        existingUsers.push(user);
        continue;
      }
      console.log("id not found");
      console.log(role);
      const newUser = new User({
        ...user,
        firstLogin: true,
        password: await bcrypt.hash(id, 10),
        registerDate: new Date(),
        suspensionRecords: [],
        isStudent: role.includes("isStudent"),
        isAdvisor: role.includes("isAdvisor"),
        isJudge: role.includes("isJudge"),
        isCoordinator: role.includes("isCoordinator"),
      });
      await newUser.save();
    }
    res.status(201).send({ message: "Users registered successfully", existingUsers });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send(info.message);
    if (user.suspended) return res.status(403).send("User is suspended");

    req.login(user, (err) => {
      if (err) return next(err);
      const userObj = user.toObject();
      delete userObj.password;
      res.status(200).json(userObj);
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
    const usersWithoutPassword = users.map((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
    res.status(200).send(usersWithoutPassword);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAdvisorUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdvisor: true });
    users.forEach((user) => {
      delete user.password;
    });
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const checkUserHasProject = async (req, res) => {
  const user = req.user;
  const projects = await Project.find({ "students.student": user._id });
  if (projects.length > 0) {
    res.status(200).send({ hasProject: true });
  } else {
    res.status(200).send({ hasProject: false });
  }
};

export const getUsersNoProjects = async (req, res) => {
  try {
    const users = await User.find();
    const usersNoProjects = [];
    for (const user of users) {
      const projects = await Project.find({ "students.student": user._id });
      if (projects.length === 0) {
        delete user.password;
        usersNoProjects.push(user);
      }
    }
    res.status(200).send({ usersNoProjects });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getPrivileges = async (req, res) => {
  const user = req.user;
  res.status(200).json({ isStudent: user.isStudent, isAdvisor: user.isAdvisor, isCoordinator: user.isCoordinator });
};

export const getUserName = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send("No user ID provided");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    const target = await User.findById(userId);

    if (!target) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({ name: target.name });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving the user");
  }
};

export const getUser = async (req, res) => {
  const user = req.user;

  const userObj = user.toObject();
  delete userObj.password;
  res.status(200).json(userObj);
};

export const changePassword = async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).send("Incorrect password");
    }
    if (oldPassword === newPassword) {
      return res.status(400).send("New password must be different from the old password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.firstLogin = false;
    user.updatedAt = new Date();
    await user.save();
    res.status(200).send("Password changed successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.id;
    res.status(200).send(userObj);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
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
    res.status(200).send({ favorite: true });
  } else {
    res.status(200).send({ favorite: false });
  }
};

export const editUserCoordinator = async (req, res) => {
  const { userId } = req.params;
  const { name, email, id, isStudent, isAdvisor, isJudge, isCoordinator } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (id !== undefined) user.id = id;
    if (isStudent !== undefined) user.isStudent = isStudent;
    if (isAdvisor !== undefined) user.isAdvisor = isAdvisor;
    if (isJudge !== undefined) user.isJudge = isJudge;
    if (isCoordinator !== undefined) user.isCoordinator = isCoordinator;
    user.updatedAt = new Date();

    await user.save();
    res.status(200).send("User updated successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const suspendUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.suspended = true;
    user.suspendedAt = new Date();
    user.suspendedBy = req.user._id;
    user.suspendedReason = req.body.reason;
    user.updatedAt = new Date();
    user.suspensionRecords.push({
      suspendedBy: req.user._id,
      suspendedAt: new Date(),
      reason: req.body.reason,
    });

    await user.save();
    res.status(200).send("User suspended successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const unsuspendUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.suspended = false;
    user.suspendedAt = null;
    user.suspendedBy = null;
    user.suspendedReason = null;
    user.updatedAt = new Date();

    await user.save();
    res.status(200).send("User unsuspended successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteSuspendedUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId).orFail();
    res.status(200).send("User deleted successfully");
  } catch (err) {
    res.status(404).send("User not found");
  }
};
