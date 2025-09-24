import { z } from "zod";
import { ObjectId } from "mongodb";
import { client } from "../config/mongoClient";

const db = client.db("career-tracker");

export interface User {
    _id?: ObjectId;
    username: string;
    hashedPassword: string;
}

export const UserSchema = z.object({
    username: z.string().min(3),
    hashedPassword: z.string().min(8),
});

export const usersCollection = db.collection<User>("users");
