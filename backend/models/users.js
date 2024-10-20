import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isStudent: { type: Boolean, required: true, default: true }, // year the student is doing the project, maybe not needed
  isAdvisor: { type: Boolean, required: true, default: false },
  isCoordinator: { type: Boolean, required: true, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false, default: [] }]
  // fields: [{ type: String, required: false, default: "" }] // advisor or coordinator fiends of interest
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
