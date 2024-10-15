import User from "../models/users.js";
import bcrypt from "bcrypt";

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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    const user = await User.findOne({
      email: email
    });
    if (!user) {
      return res.status(401).send("User or password do not match");
    }
    if (await bcrypt.compare(password, user.password)) {
      res.status(201).send("Login successful");
    } else {
      return res.status(401).send("User or password do not match");
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
