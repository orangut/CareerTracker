import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import logger from "./logger";
dotenv.config();

const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;
export const client = new MongoClient(uri);

export async function connectMongo() {
    try {
        await client.connect();
        logger.info("Connected to MongoDB");
    } catch (err) {
        logger.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
