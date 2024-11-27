import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // 'create', 'update', 'delete', 'login', 'logout', 'like', 'dislike'
  type: { type: String, required: true }, // 'submission', 'project', 'user', 'comment', 'like', 'dislike'
  date: { type: Date, required: true, default: Date.now }
});

const logModel = mongoose.model("Log", logSchema);
export default logModel;
