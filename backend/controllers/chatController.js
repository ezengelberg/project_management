import Chat from "../models/chats.js";
import User from "../models/users.js";
import Message from "../models/messages.js";

export const sendMessage = async (req, res) => {
    try {
        const { chatID, message, recievers } = req.body;
        let chatTarget;
        if (!chatID) {
            chatTarget = await Chat.findOne({
                participants: { $all: [...recievers, req.user._id] },
                $expr: { $eq: [{ $size: "$participants" }, recievers.length + 1] },
            });
            if (!chatTarget) {
                chatTarget = new Chat({ participants: [...recievers, req.user._id] });
                await chatTarget.save();
            }
        } else chatTarget = await Chat.findById(chatID);

        const messageData = await new Message({ chat: chatTarget._id, sender: req.user._id, message }).save();
        res.status(201).json(messageData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchMessages = async (req, res) => {
    // try {
    //     const messages = await Chat.find();
    //     res.status(200).json(messages);
    // } catch (error) {
    //     res.status(500).json({ message: error.message });
    // }
};

export const fetchChats = async (req, res) => {
    try {
        const user = req.user._id;
        const chats = await Chat.find({
            participants: { $in: [user] },
        }).populate("participants", "name");
        console.log(chats);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchUsers = async (req, res) => {
    try {
        const { name } = req.query;
        if (name) {
            const users = await User.find({ name: { $regex: name, $options: "i" }, _id: { $ne: req.user._id } }).select(
                "name _id",
            );
            return res.status(200).json(users);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
