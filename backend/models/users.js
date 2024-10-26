import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstLogin: { type: Boolean, required: true, default: true },
  isStudent: { type: Boolean, required: true, default: true },
  isAdvisor: { type: Boolean, required: true, default: false },
  isCoordinator: { type: Boolean, required: true, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false, default: [] }],
  registerDate: { type: Date, required: true, default: Date.now },
  selectedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false, default: null },
  suspended: { type: Boolean, default: false },
  suspendedAt: { type: Date, default: null },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  suspendedReason: { type: String, default: null },
  suspensionRecords: { type: Array, required: true, default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
