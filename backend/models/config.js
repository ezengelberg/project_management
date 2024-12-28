import mongoose from "mongoose";
import { HDate } from "@hebcal/core";

// Function to calculate and format the current Jewish year
const getDefaultJewishYear = () => {
  const today = new HDate().renderGematriya(true);
  const jewishYear = today.split(" ")[2];
  return jewishYear;
};

const configSchema = new mongoose.Schema({
  projectStudentManage: { type: Boolean, default: true },
  currentYear: { type: String, default: getDefaultJewishYear },
});

const configModel = mongoose.model("Config", configSchema);
export default configModel;
