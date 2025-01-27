import mongoose from "mongoose";

const labelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    innerColor: { type: String, required: true },
    outerColor: { type: String, required: true },
  },
  { timestamps: true }
);

const labelModel = mongoose.model("Label", labelSchema);
export default labelModel;
