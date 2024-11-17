import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: String, default: null },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoQuality: { type: String, required: true }, // Fix typo here
    workQuality: { type: String, required: true },
    writingQuality: { type: String, required: true },
    commits: { type: Number, required: true },
    journalActive: { type: String, required: true },
    overridden: {
      type: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true },
        newGrade: { type: String, required: true },
      },
      required: false,
    },
  },
  { timestamps: true }
);

const gradeModel = mongoose.model("Grade", gradeSchema);
export default gradeModel;
