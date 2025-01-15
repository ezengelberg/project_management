import mongoose from "mongoose";

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
  days: [
    {
      exams: {
        type: Map,
        of: {
          time: { type: String, required: true },
          projects: [
            {
              id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
              title: { type: String, required: true },
              students: [{ type: String, required: true }],
              judges: [{ type: String, required: true }],
            },
          ],
        },
      },
      examDate: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const examTableModel = mongoose.model("ExamTable", examTableSchema);
export default examTableModel;
