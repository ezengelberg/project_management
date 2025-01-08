import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

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

// Load environment variables and allows to use .env file
dotenv.config();

const app = express();
const server_port = process.env.SERVER_PORT || 3000;

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  res.header("Access-Control-Allow-Origin", `${process.env.CORS_ORIGIN}`);
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  next();
});

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
      maxAge: 24 * 60 * 60 * 1000, // Cookie will expire after 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax", // Use Lax for local development
    },
  }),
);

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    try {
      console.log("🔵 Serializing user:", {
        id: user._id.toString(),
        email: user.email,
      });

      // Store the user ID or minimal session data
      done(null, user._id.toString()); // Store only the ID here, or you can store a minimal session object if needed
    } catch (error) {
      console.error("❌ Serialization error:", error);
      done(error);
    }
  });
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔵 Deserializing user with ID:", id);
    const user = await User.findById(id).select("-password"); // Only fetch necessary user info
    console.log("🔑 User deserialized:", user.email);
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

app.get("/", (req, res) => {
  res.send(`Version DEV: 11`);
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

app.listen(server_port, () => {
  // awaiting for mongoDB connection before initializing config
  connectDB().then(() => {
    initializeConfig();
  });
  console.log(`Server is running at port: ${server_port}`);
});
