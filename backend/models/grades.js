import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: String, default: null },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoQuality: { type: String, default: null },
    workQuality: { type: String, default: null },
    writingQuality: { type: String, default: null },
    journalActive: { type: String, default: null },
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
