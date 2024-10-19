import mongoose from "mongoose";

const fileTemplateSchema = new mongoose.Schema({
  title: { type: String },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const FileTemplate = mongoose.model("FileTemplate", fileTemplateSchema);
export default FileTemplate;
