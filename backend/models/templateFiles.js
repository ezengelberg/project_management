import mongoose from "mongoose";

const templateFilesSchema = new mongoose.Schema({
  title: { type: String },
  filename: { type: String, required: true, unique: true },
  uploadDate: { type: Date, default: Date.now },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const templateFiles = mongoose.model("templateFiles", templateFilesSchema);

export default templateFiles;
