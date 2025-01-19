import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    year: { type: String, required: true },
  },
  { timestamps: true },
);

const announcementModel = mongoose.model("Announcement", announcementSchema);
export default announcementModel;
