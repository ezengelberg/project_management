import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true },
  suitableFor: { type: String, required: true },
  type: { type: String, required: true },
  externalEmail: { type: String, required: false },
  continues: { type: Boolean, required: false, default: false },
  isFinished: { type: Boolean, required: false, default: false },
  isTerminated: { type: Boolean, required: false, default: false },
  terminationRecord: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      joinDate: { type: Date, default: Date.now },
    },
  ],
  isTaken: { type: Boolean, required: false, default: false },
  advisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      joinDate: { type: Date, default: Date.now },
    },
  ],
  alphaReportJudges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
  finalReportJudges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
  examJudges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }],
  // Disable _id for candidates sub-documents here
  candidates: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      joinDate: { type: Date, default: Date.now },
    },
  ],
  alphaReportGrade: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: null },
  finalReportGrade: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: null },
  examGrade: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: null },
  finalGrade: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: null },
  updateRecords: [
    {
      date: { type: Date, default: Date.now },
      changes: { type: Object, required: true },
    },
  ],
});

// Apply the option to disable _id for sub-documents within `candidates`
projectSchema.path("candidates").schema.set("_id", false);
projectSchema.path("students").schema.set("_id", false);
projectSchema.path("updateRecords").schema.set("_id", false);

projectSchema.index({ title: 1, year: 1 }, { unique: true });

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
