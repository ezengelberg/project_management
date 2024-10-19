import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true }, // year the student is doing the project לאיזה שנתון שייך הפרוייקט
  isAvailable: { type: Boolean, required: true, default: false }, // is it taken or not yet
  suitableFor: { type: String, required: true }, // solo / duo / both
  type: { type: String, required: true }, // research / development / hitech / other
  continues: { type: Boolean, required: true, default: false }, // is it a continues project
  isApproved: { type: Boolean, required: true, default: false }, // is it approved by the coordinator
  isFinished: { type: Boolean, required: false, default: false }, // is it finished
  terminated: { type: Boolean, required: false, default: false }, // is it terminated
  advisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }], // the advisor(s) of the project
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: [] }], // the student(s) of the project
  grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: false, default: [] }], // the grades of the project
});

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
