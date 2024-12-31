import mongoose from "mongoose";

const gradeStructureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    tachlit: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const gradeStructureModel = mongoose.model("GradeStructure", gradeStructureSchema);
export default gradeStructureModel;
