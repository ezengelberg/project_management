import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: String, default: null },
    numericGrade: { type: Number, default: null },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoQuality: { type: String },
    workQuality: { type: String },
    writingQuality: { type: String },
    journalActive: { type: String },
    commits: { type: Number, default: null },
    overridden: {
      type: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true },
        newGrade: { type: String, required: true }
      },
      required: false
    }
  },
  { timestamps: true }
);

const gradeModel = mongoose.model("Grade", gradeSchema);
export default gradeModel;
