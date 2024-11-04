import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  index: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstLogin: { type: Boolean, required: true, default: true },
  isStudent: { type: Boolean, required: true, default: true },
  isAdvisor: { type: Boolean, required: true, default: false },
  isCoordinator: { type: Boolean, required: true, default: false },
  isJudge: { type: Boolean, required: true, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false, default: [] }],
  registerDate: { type: Date, required: true, default: Date.now },
  suspended: { type: Boolean, default: false },
  suspendedAt: { type: Date, default: null },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  suspendedReason: { type: String, default: null },
  suspensionRecords: { type: Array, required: true, default: [] },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && !this.index) {
      // First try to get the max index
      const maxIndexUser = await this.constructor.findOne({}, { index: 1 }).sort({ index: -1 });
      // If there's a maxIndexUser and it has a valid index, increment it
      if (maxIndexUser && typeof maxIndexUser.index === "number") {
        this.index = maxIndexUser.index + 1;
      } else {
        // If no users exist or no valid index found, start from 1
        this.index = 1;
      }
      if (!Number.isInteger(this.index)) {
        throw new Error("Failed to generate valid index");
      }
    }
    next();
  } catch (error) {
    console.log("Error in pre-validate middleware:", error);
    next(error);
  }
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
