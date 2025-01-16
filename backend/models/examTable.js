import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    projects: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        title: { type: String, required: true },
        students: [
          {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            name: { type: String, required: true },
          },
        ],
        judges: [
          {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            name: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    date: { type: Date },
    exams: [examSchema],
  },
  { _id: false }
);

const examTableSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },
  name: { type: String, required: true },
  year: { type: String, required: true },
  classes: {
    class1: { type: String, required: true },
    class2: { type: String, required: true },
    class3: { type: String, required: true },
    class4: { type: String, required: true },
  },
  days: [daySchema],
  createdAt: { type: Date, default: Date.now },
});

const examTableModel = mongoose.model("ExamTable", examTableSchema);
export default examTableModel;
