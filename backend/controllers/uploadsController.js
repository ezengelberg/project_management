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
  console.log("Creating file...");

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
      let decodedFilename =
        req.headers["x-filename-encoding"] === "url" ? decodeURIComponent(file.originalname) : file.originalname;

      // Generate a unique filename if a duplicate exists
      const destinationPath = path.join(process.cwd(), `uploads/${req.body.destination}`);
      const generateUniqueFilename = (filename) => {
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        let counter = 1;
        let newFilename = `${base}-${counter}${ext}`;

        while (fs.existsSync(path.join(destinationPath, newFilename))) {
          counter++;
          newFilename = `${base}-${counter}${ext}`;
        }

        return newFilename;
      };

      const existingFile = await Upload.findOne({ filename: decodedFilename, destination: req.body.destination });
      if (existingFile) {
        decodedFilename = generateUniqueFilename(decodedFilename);
      }

      try {
        // Save file metadata to the database
        const newFile = new Upload({
          title: req.body.title || decodedFilename,
          filename: decodedFilename,
          description: req.body.description,
          user: req.user._id,
          destination: req.body.destination
        });

        await newFile.save();

        // Rename the file on the server
        fs.renameSync(file.path, path.join(destinationPath, decodedFilename));
        savedFiles.push(newFile);
      } catch (error) {
        // Remove the uploaded file in case of an error
        fs.unlinkSync(file.path);
        console.error("File save error:", error.message);
        throw error;
      }
    }

    // Send response with saved files
    res.status(201).json({
      message: "Files uploaded and saved successfully",
      files: savedFiles
    });
  } catch (error) {
    console.error("Error in createFile:", error.message);

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.warn("Error cleaning up file:", file.path, err.message);
        }
      });
    }

    const statusCode = error.message === "A file with this name already exists" ? 409 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    file.editRecord.push({
      oldTitle: req.body.oldTitle,
      newTitle: req.body.title,
      oldDescription: req.body.oldDescription,
      newDescription: req.body.description,
      editDate: new Date(),
      editedBy: { name: user.name, id: user.id }
    });

    file.title = req.body.title;
    file.description = req.body.description;

    const updatedFile = await file.save();
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
