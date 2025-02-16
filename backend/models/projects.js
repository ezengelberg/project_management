import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    missions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mission", required: false, default: [] }],
  },
  { timestamps: true }
);

const studentSuggestionsSchema = new mongoose.Schema(
  {
    suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    suggestedDate: { type: Date, default: Date.now },
    stage: { type: Number },
    denyProject: { type: Boolean, required: false, default: false },
    denyDate: { type: Date, required: false },
    denyReason: { type: String, required: false },
    acceptProject: { type: Boolean, required: false, default: false },
    acceptDate: { type: Date, required: false },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: String, required: true },
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
  // Disable _id for candidates sub-documents here
  candidates: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      joinDate: { type: Date, default: Date.now },
    },
  ],
  updateRecords: [
    {
      date: { type: Date, default: Date.now },
      changes: { type: Object, required: true },
    },
  ],
  editRecord: [
    {
      oldTitle: { type: String },
      newTitle: { type: String },
      oldDescription: { type: String },
      newDescription: { type: String },
      oldSuitableFor: { type: String },
      newSuitableFor: { type: String },
      oldType: { type: String },
      newType: { type: String },
      oldExternalEmail: { type: String },
      newExternalEmail: { type: String },
      oldContinues: { type: String },
      newContinues: { type: String },
      oldYear: { type: String },
      newYear: { type: String },
      editDate: { type: Date, default: Date.now },
      editedBy: {
        name: { type: String },
      },
    },
  ],
  journal: journalSchema,
  studentSuggestions: studentSuggestionsSchema,
});

// Apply the option to disable _id for sub-documents within `candidates`
projectSchema.path("candidates").schema.set("_id", false);
projectSchema.path("students").schema.set("_id", false);
projectSchema.path("updateRecords").schema.set("_id", false);

projectSchema.index({ title: 1, year: 1 }, { unique: true });

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
