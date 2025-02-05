import Chat from "../models/chats.js";
import User from "../models/users.js";
import Message from "../models/messages.js";
import { io } from "../server.js";

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
        } else {
            chatTarget = await Chat.findById(chatID);
        }

        const messageData = await new Message({
            chat: chatTarget._id,
            sender: req.user._id,
            message,
            seenBy: [req.user._id],
        }).save();

        chatTarget.lastMessage = messageData._id;
        await chatTarget.save();

        // Fetch updated chat with populated lastMessage
        const updatedChat = await Chat.findById(chatTarget._id).populate("lastMessage").populate("participants");

        // Emit message to all users in the chat
        io.to(chatTarget._id.toString()).emit("receive_message", updatedChat);

        res.status(201).json(messageData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchMessages = async (req, res) => {
    try {
        const { chatID } = req.query;
        const messages = await Message.find({ chat: chatID })
            .populate("sender", "name")
            .sort({ createdAt: 1 })
            .populate("seenBy", "name");
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const checkUnreadMessages = async (chatID, user) => {
    const chat = await Chat.findById(chatID);
    if (!chat) return 0;
    const unreadMessages = await Message.countDocuments({
        chat: chatID,
        sender: { $ne: user },
        seenBy: { $ne: user },
    });
    return unreadMessages;
};

export const fetchChats = async (req, res) => {
    try {
        const user = req.user._id;
        const chats = await Chat.find({
            participants: { $in: [user] },
        })
            .populate("participants", "name")
            .populate({
                path: "lastMessage",
                select: "message createdAt",
                populate: {
                    path: "sender",
                    select: "name",
                },
            })
            .lean();

        for (let chat of chats) {
            chat.unreadTotal = await checkUnreadMessages(chat._id, user);
        }

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
