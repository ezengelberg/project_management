import Upload from "../models/uploads.js";
import User from "../models/users.js";
import fs from "fs";
import path from "path";

export const getFiles = async (req, res) => {
  try {
    const destination = req.query.destination; // Use `req.query` for GET request parameters
    if (!destination) {
      return res.status(400).send({ message: "Destination is required" });
    }

    const files = await Upload.find({ destination });
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
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    const savedFiles = [];
    for (const file of req.files) {
      const decodedFilename =
        req.headers["x-filename-encoding"] === "url" ? decodeURIComponent(file.originalname) : file.originalname;
      try {
        const newFile = new Upload({
          title: req.body.title || decodedFilename,
          filename: decodedFilename,
          description: req.body.description,
          user: req.user._id,
          destination: req.body.destination
        });
        await newFile.save();

        // Rename file on server to decoded filename
        const newPath = path.join(path.dirname(file.path), decodedFilename);
        fs.renameSync(file.path, newPath);
        savedFiles.push(newFile);
      } catch (error) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        console.error("File save error:", error.message);
        throw error;
      }
    }

    res.status(201).json({
      message: "Files uploaded and saved successfully",
      files: savedFiles
    });
  } catch (err) {
    console.error("Error in createFile:", err);
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(err.message === "A file with this name already exists" ? 409 : 500).json({ message: err.message });
  }
};

export const updateFile = async (req, res) => {
  console.log("editting file");
  console.log(req.params.id);
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
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const result = await Upload.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "File not found" });
    }

    const destination = req.query.destination; // Use query instead of body
    if (!destination) {
      return res.status(400).send({ message: "Destination is required" });
    }

    const filePath = path.join(process.cwd(), `uploads/${destination}`, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).send({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    console.log("Downloading file");
    console.log(req.params.id);
    const file = await Upload.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const destination = req.query.destination; // Use query instead of body
    if (!destination) {
      return res.status(400).send({ message: "Destination is required" });
    }

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
