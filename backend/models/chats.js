import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    chatName: {
        type: String,
        default: "",
        required: false,
    },
});

const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
