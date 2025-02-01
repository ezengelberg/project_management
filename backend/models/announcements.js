import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    year: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    forStudent: { type: Boolean, default: true },
    forAdvisor: { type: Boolean, default: true },
    forJudge: { type: Boolean, default: true },
    forCoordinator: { type: Boolean, default: true },
    writtenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const announcementModel = mongoose.model("Announcement", announcementSchema);
export default announcementModel;
