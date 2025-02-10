import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// socket.io
import http from "http";
import { Server } from "socket.io";

import session from "express-session";
import passport from "./config/passport.js";
import { checkPassportState } from "./config/passport.js";

import { connectDB } from "./config/db.js";
import MongoStore from "connect-mongo";

import User from "./models/users.js";

import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";
import uploadsRoute from "./routes/uploadsRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import gradeRoute from "./routes/gradeRoute.js";
import gradeStructureRoute from "./routes/gradeStructureRoute.js";
import randomRoute from "./routes/randomRoute.js";
import configRoute from "./routes/configRoute.js";
import Config from "./models/config.js";
import groupRoute from "./routes/groupRoute.js";
import missionRoute from "./routes/missionRoute.js";
import zoomRoute from "./routes/zoomRoute.js";
import announcementRoute from "./routes/announcementRoute.js";
import chatRoute from "./routes/chatRoute.js";

import Chat from "./models/chats.js";
import Message from "./models/messages.js";

import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
}

const app = express();

const server = http.createServer(app); // Create an HTTP server for socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});

export { io };

const server_port = process.env.SERVER_PORT || 3000;

// app.use((req, res, next) => {
//   console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
//   res.header("Access-Control-Allow-Origin", `${process.env.CORS_ORIGIN}`);
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
//   next();
// });

// Allow cross-origin requests
const corsOptions = {
    origin: process.env.CORS_ORIGIN, // Allow all origins for Development purposes only
    credentials: true, // Allow cookies and credentials
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "x-filename-encoding"],
    preflightContinue: false, // Respond to OPTIONS automatically
    optionsSuccessStatus: 204, // Add this
};

// Apply CORS globally
app.use(cors(corsOptions));

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // Trust the first proxy (e.g., Cloudflare or NGINX)
}

app.use(
    session({
        secret: process.env.SESSION_SECRET, // Set a strong secret in .env file
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.NODE_ENV === "production" ? process.env.MONGO_URI : process.env.MONGO_URI_LOCAL,
            collectionName: "sessions",
            ttl: 24 * 60 * 60, // Time to live - 1 day (in seconds)
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000 * 365, // Cookie will expire after 1 year
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
            sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax", // Use Lax for local development
        },
    }),
);

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        try {
            done(null, user._id.toString()); // Store only the ID here, or you can store a minimal session object if needed
        } catch (error) {
            done(error);
        }
    });
});

passport.deserializeUser(async (id, done) => {
    try {
        // console.log("🔵 Deserializing user with ID:", id);
        const user = await User.findById(id).select("-password"); // Only fetch necessary user info
        // console.log("🔑 User deserialized:", user.email);
        done(null, user);
    } catch (error) {
        console.error("❌ Deserialization error:", error);
        done(error);
    }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(checkPassportState);

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use("/api/user", userRoute);
app.use("/api/project", projectRoute);
app.use("/api/submission", submissionRoute);
app.use("/api/grade", gradeRoute);
app.use("/api/grade-structure", gradeStructureRoute);
app.use("/api/uploads", uploadsRoute);
app.use("/api/random", randomRoute);
app.use("/api/config", configRoute);
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use("/api/group", groupRoute);
app.use("/api/announcement", announcementRoute);
app.use("/api/chat", chatRoute);

app.get("/", (req, res) => {
    res.send(`Version DEV: 13`);
});

async function initializeConfig() {
    try {
        const config = await Config.findOne();
        if (!config) {
            await Config.create({});
            console.log("Default configuration created");
        } else {
            console.log("Configuration file loaded");
        }
    } catch (error) {
        console.error("Error initializing configuration:", error);
    }
}

server.listen(server_port, () => {
    // awaiting for mongoDB connection before initializing config
    connectDB().then(() => {
        initializeConfig();
    });
    console.log(`Server is running at port: ${server_port}`);
});

import updateRecurringMeetings from "./scheduler/meetingScheduler.js";
import schedule from "node-schedule";

// Schedule the task to run every hour
schedule.scheduleJob("0 * * * *", async () => {
    try {
        await updateRecurringMeetings();
    } catch (error) {
        console.error("Error updating recurring meetings:", error);
    }
});

const activeChats = {};
// Socket.io
io.on("connection", (socket) => {
    socket.on("join_chats", (chats) => {
        chats.forEach((chat) => {
            socket.join(chat);
            // console.log(`User joined chat: ${chat}`);

            if (!activeChats[chat]) {
                activeChats[chat] = new Set();
            }
            activeChats[chat].add(socket.id);
            // console.log(`Active users in chat ${chat}:`, activeChats[chat]);
        });
    });

    socket.on("send_message", async ({ chatID, message, sender }) => {
        try {
            console.log("SENDING MESSAGE");
            const chat = await Chat.findById(chatID).populate("lastMessage").populate("participants");
            if (!chat) {
                console.log("Chat not found");
                return;
            }
            console.log("Chat found:", chat);
            // Emit updated chat to all users in the chat room
            io.to(chatID).emit("receive_chat", chat);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on("typing start", async ({ chatID, user }) => {
        try {
            console.log("typing start");
            io.to(chatID).emit("typing_start", user);
            console.log("emitted?");
        } catch (error) {
            console.error("Error sending typing start:", error);
        }
    });

    socket.on("typing stop", async ({ chatID, user }) => {
        try {
            console.log("typing stop");
            io.to(chatID).emit("typing_stop", user);
        } catch (error) {
            console.error("Error sending typing stop:", error);
        }
    });

    socket.on("seen_message", async ({ messageID, chatID, user }) => {
        try {
            const message = await Message.findById(messageID);
            if (!message) return;

            // Check if user is already in seenBy
            const alreadySeen = message.seenBy.some((seen) => seen.user.toString() === user);

            if (!alreadySeen) {
                message.seenBy.push({ user, time: new Date() }); // Push user with timestamp
                await message.save();

                // Populate the updated message
                const seenMessage = await Message.findById(messageID)
                    .populate("sender", "name")
                    .populate({
                        path: "seenBy.user",
                        select: "name",
                    })
                    .lean();

                io.to(chatID).emit("receive_seen", seenMessage);
            }
        } catch (error) {
            console.error("Error updating seen status:", error);
        }
    });

    socket.on("disconnect", () => {
        // Remove user from all active chats
        for (const chatID in activeChats) {
            activeChats[chatID].delete(socket.id);
            // console.log(`Active users in chat ${chatID}:`, activeChats[chatID]);

            // If no users are left in the chat, you can deactivate or remove the chat from activeChats
            if (activeChats[chatID].size === 0) {
                delete activeChats[chatID];
                console.log(`Chat ${chatID} is now inactive`);
            }
        }
    });
});
