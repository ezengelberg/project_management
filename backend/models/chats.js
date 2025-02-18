import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
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
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: false,
        },
    },
    { timestamps: true },
);

const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
