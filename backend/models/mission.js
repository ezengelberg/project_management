import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    labels: [{ type: String, required: false, default: [] }],
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: String, required: false, default: [] }],
    number: { type: Number, required: true },
  },
  { timestamps: true }
);

const missionModel = mongoose.model("Mission", missionSchema);
export default missionModel;
