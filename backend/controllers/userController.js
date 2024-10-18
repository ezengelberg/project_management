import User from "../models/users.js";
import bcrypt from "bcrypt";
import passport from "passport";

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
  if (req.isAuthenticated()) {
    return res.status(200).send("Already logged in");
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send(info.message); // Send error from strategy

    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).send("Login successful");
    });
  })(req, res, next);
};

export const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Pass the error to the error-handling middleware
    }
    res.status(200).send("Logged out successfully");
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
