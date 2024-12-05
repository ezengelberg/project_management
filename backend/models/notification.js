import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel = mongoose.model("Notification", notificationSchema);
export default notificationModel;
