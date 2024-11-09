import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: Number, default: null },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the judge that gave the grade
    comment: { type: String, required: false, default: "" }, // the comment the judge gave
    overridden: {
      type: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the coordinator that overriden the grade
        comment: { type: String, required: true }, // the comment the coordinator
        newGrade: { type: Number, required: true } // the new grade the coordinator
      },
      required: false
    } // if the grade was overriden by the coordinator
  },
  { timestamps: true }
);

const gradeModel = mongoose.model("Grade", gradeSchema);
export default gradeModel;
