import mongoose from "mongoose";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
const getDefaultJewishYear = () => {
  const today = formatJewishDateInHebrew(toJewishDate(new Date()));
  const jewishYear = today.split(" ").pop().replace(/^ה/, "");
  return jewishYear;
};

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  year: { type: String, default: getDefaultJewishYear },
});

const groupModel = mongoose.model("Group", groupSchema);
export default groupModel;
