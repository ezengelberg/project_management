import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }],
  finalGrade: { type: Number, required: false, default: 0 },
  name: { type: String, required: true },
  file: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: false }, // needs an update
  submissionDate: { type: Date },
  isReviewed: { type: Boolean, default: false },
  isGraded: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
});

const submissionModel = mongoose.model("Submission", submissionSchema);
export default submissionModel;
