import templateFiles from "../models/templateFiles.js";
import User from "../models/users.js";
import fs from "fs";
import path from "path";

export const getTemplateFiles = async (req, res) => {
  try {
    const files = await templateFiles.find();
    res.status(200).send(files);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const createTemplateFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const savedFiles = [];
    for (const file of req.files) {
      const fileTemplate = new templateFiles({
        title: req.body.title ? req.body.title : file.originalname,
        filename: file.filename,
        description: req.body.description,
        user: req.user._id,
      });
      await fileTemplate.save();
      savedFiles.push(fileTemplate);
    }

    res.status(201).json({
      message: "Files uploaded and saved successfully",
      templateFiles: savedFiles,
    });
  } catch (err) {
    if (err.message === "A file with this name already exists") {
      res.status(409).send({ message: err.message }); // 409 Conflict
    } else {
      res.status(500).send({ message: err.message });
    }
  }
};

export const deleteTemplateFiles = async (req, res) => {
  try {
    const result = await templateFiles.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "File template not found" });
    }
    res.status(200).send({ message: "File template deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const downloadTemplateFile = async (req, res) => {
  try {
    const file = await templateFiles.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const filePath = path.join(process.cwd(), "templateFiles", file.filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, file.filename);
    } else {
      res.status(404).send({ message: "File not found on server" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
