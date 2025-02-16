import Chat from "../models/chats.js";
import User from "../models/users.js";
import Message from "../models/messages.js";
import { io } from "../server.js";

export const sendMessage = async (req, res) => {
    try {
        const { chatID, message, recievers } = req.body;
        let chatTarget;
        let isNewChat = false;
        if (chatID === "new" || !chatID) {
            chatTarget = await Chat.findOne({
                participants: { $all: [...recievers, req.user._id] },
                $expr: { $eq: [{ $size: "$participants" }, recievers.length + 1] },
            });
            if (!chatTarget) {
                chatTarget = new Chat({ participants: [...recievers, req.user._id] });
                await chatTarget.save();
                isNewChat = true;
            }
        } else {
            chatTarget = await Chat.findById(chatID);
        }

        let messageData = new Message({
            chat: chatTarget._id,
            sender: req.user._id,
            message,
            seenBy: [
                {
                    user: req.user._id,
                },
            ],
        });

        // First save the message
        messageData = await messageData.save();

        // Then populate the fields
        messageData = await Message.findById(messageData._id)
            .populate("sender", "name")
            .populate({
                path: "seenBy.user",
                select: "name",
            })
            .lean();

        chatTarget.lastMessage = messageData;
        await chatTarget.save();

        console.log(chatTarget);
        // Emit message to all users in the chat
        io.to(chatTarget._id.toString()).emit("receive_message", messageData);
        console.log("📤 Message sent to chat:", chatTarget._id.toString());
        io.to(chatTarget._id.toString()).emit("receive_chat", chatTarget, messageData);
        res.status(201).json({ messageData, isNewChat });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const fetchMessages = async (req, res) => {
    try {
        const { chatID, limit } = req.query;
        const messages = await Message.find({ chat: chatID })
            .populate("sender", "name")
            .sort({ createdAt: 1 })
            .populate({
                path: "seenBy.user",
                select: "name",
            })
            .lean();
        const returnMessages = messages.slice(-limit);
        const unseenMessages = messages.filter((msg) => {
            return (
                msg.sender._id.toString() !== req.user._id.toString() &&
                !msg.seenBy.some((s) => s.user._id.toString() === req.user._id.toString())
            );
        });

        const uniqueMessages = [
            ...new Map([...returnMessages, ...unseenMessages].map((item) => [item._id.toString(), item])).values(),
        ];

        uniqueMessages.sort((a, b) => a.createdAt - b.createdAt);

        res.status(200).json(uniqueMessages);
        // res.status(200).json(returnMessages);
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
        "seenBy.user": { $ne: user },
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

export const fetchChat = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id)
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

        chat.unreadTotal = await checkUnreadMessages(chat, req.user._id);
        res.status(200).json(chat);
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
