import mongoose from "mongoose";

const numericValuesSchema = new mongoose.Schema({
  letter: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});

const numericValuesModel = mongoose.model("NumericValue", numericValuesSchema);
export default numericValuesModel;
