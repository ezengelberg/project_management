import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  projectStudentManage: { type: Boolean, default: true },
});

const configModel = mongoose.model("Config", configSchema);
export default configModel;
