import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
    projectCreation: {type: Boolean, default: true},
    projectRegistration: {type: Boolean, default: true},
    projectStudentManage: {type: Boolean, default: true},
});

const configModel = mongoose.model("Config", configSchema);
export default configModel;