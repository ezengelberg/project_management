import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    year: { type: Number, required: true },
    status: { type: String, required: true, default: "open" }, // status of the project, is it taken or not yet
    suitableFor: { type: String, required: true }, // solo / duo / both
    advisor: [{ type: String, required: false, default: []}],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, default: [] }],
});

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;