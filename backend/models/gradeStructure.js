import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
});

const gradeStructureSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },
    groupName: { type: String },
    items: [itemSchema],
    year: { type: String },
  },
  { timestamps: true }
);

const gradeStructureModel = mongoose.model("GradeStructure", gradeStructureSchema);
export default gradeStructureModel;
