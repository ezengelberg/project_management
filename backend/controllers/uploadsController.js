import Upload from "../models/uploads.js";
import User from "../models/users.js";
import fs from "fs";
import path from "path";

export const getFiles = async (req, res) => {
  try {
    const yes = req.body.destination;
    const destination = req.body.destination;
    const files = await Upload.find({ destination: destination });
    res.status(200).send(files);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const createFile = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  try {
    const user = User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const savedFiles = [];
    for (const file of req.files) {
      let decodedFilename;
      if (req.headers["x-filename-encoding"] === "url") {
        decodedFilename = decodeURIComponent(file.originalname);
      } else {
        decodedFilename = file.originalname;
      }
      try {
        const file = new Upload({
          title: req.body.title ? req.body.title : decodedFilename,
          filename: decodedFilename,
          description: req.body.description,
          user: req.user._id
        });
        await file.save();
        try {
          // Rename the file on the server to use the decoded filename
          fs.renameSync(file.path, path.join(path.dirname(file.path), decodedFilename));
        } catch (fsError) {
          await file.delete(file._id);
          throw new Error(`File system error: ${fsError.message}`);
        }
        savedFiles.push(file);
      } catch (error) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      }
    }
    res.status(201).json({
      message: "Files uploaded and saved successfully",
      files: savedFiles
    });
  } catch (err) {
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    if (err.message === "A file with this name already exists") {
      res.status(409).send({ message: err.message }); // 409 Conflict
    } else {
      res.status(500).send({ message: err.message });
    }
  }
};

export const updateFile = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }
    const updatedFile = await Upload.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(updatedFile);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteFile = async (req, res) => {
  const file = await Upload.findById(req.params.id);
  if (!file) {
    return res.status(404).send({ message: "File not found" });
  }
  const result = await Upload.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).send({ message: "File not found" });
  }
  const destination = req.body.destination;
  const filePath = path.join(process.cwd(), `uploads/${destination}`, file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.status(200).send({ message: "File deleted successfully" });
};

export const downloadFile = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }
    const destination = req.body.destination;
    const filePath = path.join(process.cwd(), `uploads/${destination}`, file.filename);
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`);
      res.sendFile(filePath);
    } else {
      res.status(404).send({ message: "File not found on server" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
