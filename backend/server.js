import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";

// Load environment variables and allows to use .env file
dotenv.config();

const app = express();
const server_port = process.env.SERVER_PORT || 3000;

app.listen(server_port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${server_port}`);
});
