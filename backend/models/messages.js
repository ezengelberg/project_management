import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        seenBy: [
            new mongoose.Schema(
                {
                    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                    time: { type: Date, default: Date.now },
                },
                { _id: false }, // Prevents automatic _id assignment
            ),
        ],
    },
    { timestamps: true },
);

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
