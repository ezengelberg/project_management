import mongoose from "mongoose";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

// Function to calculate and format the current Jewish year
const getDefaultJewishYear = () => {
  const today = formatJewishDateInHebrew(toJewishDate(new Date()));
  const jewishYear = today.split(" ").pop().replace(/^ה/, "");
  return jewishYear;
};

const configSchema = new mongoose.Schema({
  projectStudentManage: { type: Boolean, default: true },
  currentYear: { type: String, default: getDefaultJewishYear },
});

const configModel = mongoose.model("Config", configSchema);
export default configModel;
