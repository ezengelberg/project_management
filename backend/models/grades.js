import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: Number, required: true },
    type: { type: String, required: true }, // alpha / beta / presentation / final
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }, // the project the grade is for
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the judge that gave the grade
    comment: { type: String, required: false, default: "" }, // the comment the judge gave
    overridden: {
      type: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null }, // the coordinator that overriden the grade
        comment: { type: String, required: false, default: "" }, // the comment the coordinator
        newGrade: { type: Number, required: false, default: null } // the new grade the coordinator
      },
      required: false
    } // if the grade was overriden by the coordinator
  },
  { timestamps: true }
);

const gradeModel = mongoose.model("Grade", gradeSchema);
export default gradeModel;
