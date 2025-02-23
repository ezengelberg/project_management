import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class Database {
    constructor() {
        if (!Database.instance) {
            this.connection = null;
            Database.instance = this;
        }
        return Database.instance;
    }

    async connect() {
        if (this.connection) {
            return this.connection;
        }

        try {
            this.connection = await mongoose.connect(
                process.env.NODE_ENV === "production" ? process.env.MONGO_URI : process.env.MONGO_URI_LOCAL,
            );

            console.log(`MongoDB Connected: ${this.connection.connection.host}`);
            return this.connection;
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1); // Exit on failure
        }
    }
}

// Export a single instance
const dbInstance = new Database();
export default dbInstance;
