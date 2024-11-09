import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  title: { type: String },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  destination: { type: String },
  editRecord: [
    {
      oldTitle: { type: String },
      newTitle: { type: String },
      oldDescription: { type: String },
      newDescription: { type: String },
      editDate: { type: Date, default: Date.now },
      editedBy: {
        name: { type: String },
        id: { type: String },
      },
    },
  ],
});

const uploadModel = mongoose.model("Upload", uploadSchema);
export default uploadModel;
