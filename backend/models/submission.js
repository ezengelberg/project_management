import mongoose from "mongoose";

const numericValuesSchema = new mongoose.Schema({
  letter: { type: String, required: true },
  value: { type: Number, required: true },
});

const submissionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }],
    finalGrade: { type: Number, required: false, default: 0 },
    name: { type: String, required: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: false }, // needs an update
    submissionDate: { type: Date },
    isReviewed: { type: Boolean, default: false },
    isGraded: { type: Boolean, default: false },
    editable: { type: Boolean, default: true },
    submissionInfo: { type: String, default: "" },
    uploadDate: { type: Date },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    numericValues: { type: [numericValuesSchema], default: [] }, // Add array of numeric values
  },
  { timestamps: true }
);

const submissionModel = mongoose.model("Submission", submissionSchema);
export default submissionModel;
