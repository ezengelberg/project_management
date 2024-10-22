import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isStudent: { type: Boolean, required: true, default: true }, // year the student is doing the project, maybe not needed
  isAdvisor: { type: Boolean, required: true, default: false },
  isCoordinator: { type: Boolean, required: true, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false, default: [] }],
  registerDate: { type: Date, required: true, default: Date.now },
  selectedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false, default: null },
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
