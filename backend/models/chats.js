import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  recievers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  ],
});

const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
