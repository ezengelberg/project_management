import mongoose from "mongoose";

const numericValuesSchema = new mongoose.Schema({
  letter: { type: String, required: true },
  value: { type: Number, required: true },
});

const submissionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }],
    finalGrade: { type: Number, required: false, default: null },
    name: { type: String, required: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: false },
    fileNeeded: { type: Boolean, required: true },
    submissionDate: { type: Date },
    isReviewed: { type: Boolean, default: false },
    isGraded: { type: Boolean, default: false },
    submissionInfo: { type: String, default: "" },
    uploadDate: { type: Date },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    numericValues: { type: [numericValuesSchema], default: [] },
    editable: { type: Boolean, default: true },
    askForExtraUpload: { type: Boolean, default: false },
    requestExtraUploadDate: { type: Date },
    gotExtraUpload: { type: Boolean, default: false },
    gotExtraUploadDate: { type: Date },
    denyExtraUpload: { type: Boolean, default: false },
    askAgainForExtraUpload: { type: Boolean, default: false },
    extraUploadFile: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: false },
    extraUploadDate: { type: Date },
    extraUploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    overridden: {
      type: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        oldGrades: [
          {
            grade: { type: Number, required: true },
            comment: { type: String },
          },
        ],
        newGrade: { type: Number, required: true },
      },
      required: false,
    },
    averageCalculation: { type: Boolean, default: false }, // If false -> calculate by median | If true -> calculate by average
  },
  { timestamps: true }
);

const submissionModel = mongoose.model("Submission", submissionSchema);
export default submissionModel;
