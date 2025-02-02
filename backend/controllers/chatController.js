import Chat from "../models/chats.js";
import User from "../models/users.js";

export const sendMessage = async (req, res) => {
    try {
        const { sender, message, recievers } = req.body;
        const newMessage = new Chat({ sender, message, recievers });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchMessages = async (req, res) => {
    try {
        const messages = await Chat.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchChats = async (req, res) => {
    try {
        const user = req.user._id;
        const chats = await Chat.find({
            $or: [{ sender: user }, { recievers: { $in: [user] } }],
        });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchUsers = async (req, res) => {
    try {
        const { name } = req.query;
        if (name) {
            const users = await User.find({ name: { $regex: name, $options: "i" } }).select("name _id");
            return res.status(200).json(users);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
