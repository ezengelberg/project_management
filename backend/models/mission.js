import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    journal: { type: mongoose.Schema.Types.ObjectId, ref: "Journal", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label", required: false, default: [] }],
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mission", required: false, default: [] }],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: String, required: false, default: [] }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: false, default: [] }],
    number: { type: Number, required: true },
  },
  { timestamps: true }
);

const missionModel = mongoose.model("Mission", missionSchema);
export default missionModel;
