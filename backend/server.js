import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import { connectDB } from "./config/db.js";

import userRoute from "./routes/userRoute.js";

// Load environment variables and allows to use .env file
dotenv.config();

const app = express();
const server_port = process.env.SERVER_PORT || 3000;

// Allow cross-origin requests
app.use(cors());

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.json());

app.use("/api/user", userRoute);

app.listen(server_port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${server_port}`);
});
