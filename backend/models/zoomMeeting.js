import mongoose from "mongoose";

const zoomMeetingSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    startTime: { type: Date, required: false },
    duration: { type: Number, required: true, default: 60 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinUrl: { type: String, required: true },
    startUrl: { type: String, required: true },
    recurring: { type: Boolean, default: false },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    recurrence: {
      type: {
        type: String,
        enum: ["daily", "weekly", "monthly", null],
        default: null,
      },
      interval: { type: Number },
    },
    endTime: { type: Date },
  },
  { timestamps: true }
);

const ZoomMeeting = mongoose.model("ZoomMeeting", zoomMeetingSchema);

export default ZoomMeeting;
