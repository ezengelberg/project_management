import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true }, // year the student is doing the project לאיזה שנתון שייך הפרוייקט
  isAvailable: { type: Boolean, required: true, default: false }, // is it taken or not yet
  suitableFor: { type: String, required: true }, // solo / duo / both
  type: { type: String, required: true }, // research / development / hitech / other
  status: { type: String, required: true, default: "new" }, // New / Continues
  isApproved: { type: Boolean, required: true, default: false }, // is it approved by the coordinator
  advisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }], // the advisor(s) of the project
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, default: [] }], // the student(s) of the project
  grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }] // the grades of the project
});

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
