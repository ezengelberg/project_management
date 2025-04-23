import mongoose from "mongoose";

const gradeMeaningSchema = new mongoose.Schema(
  {
    gradesMeaning: {
      type: [
        {
          letter: { type: String, required: true },
          meaning: { type: String, default: "" },
        },
      ],
      default: [
        { letter: "A+", meaning: "" },
        { letter: "A", meaning: "" },
        { letter: "A-", meaning: "" },
        { letter: "B+", meaning: "" },
        { letter: "B", meaning: "" },
        { letter: "B-", meaning: "" },
        { letter: "C+", meaning: "" },
        { letter: "C", meaning: "" },
        { letter: "C-", meaning: "" },
        { letter: "D+", meaning: "" },
        { letter: "D", meaning: "" },
        { letter: "D-", meaning: "" },
        { letter: "E", meaning: "" },
        { letter: "F", meaning: "" },
      ],
    },
  },
  { timestamps: true }
);

const gradeMeaningModel = mongoose.model("GradeMeaning", gradeMeaningSchema);
export default gradeMeaningModel;
