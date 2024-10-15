import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: Number, required: true },
    type: { type: String, required: true }, // alpha / beta / presentation / final
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: false, default: "" }
  },
  { timestamps: true }
);

const gradeModel = mongoose.model("Grade", gradeSchema);
export default gradeModel;
