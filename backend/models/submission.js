import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }],
  name: { type: String, required: true },
  file: { type: String, required: false }, // needs an update
  submissionDate: { type: Date, required: true },
  
});

const submissionModel = mongoose.model("Submission", submissionSchema);
export default submissionModel;