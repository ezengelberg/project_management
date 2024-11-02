import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true },
  suitableFor: { type: String, required: true },
  type: { type: String, required: true },
  externalEmail: { type: String, required: false },
  continues: { type: Boolean, required: false, default: false },
  isApproved: { type: Boolean, required: false, default: false },
  isFinished: { type: Boolean, required: false, default: false },
  isTerminated: { type: Boolean, required: false, default: false },
  terminationRecord: { type: Array, required: false, default: [] },
  isTaken: { type: Boolean, required: false, default: false },
  advisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      joinDate: { type: Date, default: Date.now },
    },
  ],
  // Disable _id for candidates sub-documents here
  candidates: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      joinDate: { type: Date, default: Date.now },
    },
  ],
  grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }],
});

// Apply the option to disable _id for sub-documents within `candidates`
projectSchema.path("candidates").schema.set("_id", false);
projectSchema.path("students").schema.set("_id", false);

projectSchema.index({ title: 1, year: 1 }, { unique: true });

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
