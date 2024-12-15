import mongoose from "mongoose";

const randomSchema = new mongoose.Schema(
  {
    descriptionForGradeStructure: { type: String, required: true },
  },
  { timestamps: true }
);

const randomModel = mongoose.model("Random", randomSchema);
export default randomModel;
