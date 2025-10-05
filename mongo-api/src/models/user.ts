import {z} from "zod";
import {ObjectId} from "mongodb";
import {client} from "../config/mongoClient";

const db = client.db("career-tracker");

export interface User {
    _id?: ObjectId;
    username: string;
    hashedPassword: string;
}

export const UserCreateSchema = z.object({
    username: z.string().min(3),
    hashedPassword: z.string().min(8),
});

export type UserCreateData = z.infer<typeof UserCreateSchema>;

export const UserSchemaUpdate = UserCreateSchema.partial()
export type UserUpdateData = z.infer<typeof UserSchemaUpdate>;

export const UserLoginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long."),
    password: z.string().min(8, "Password must be at least 8 characters long."), // Plaintext password
});
export type UserLoginData = z.infer<typeof UserLoginSchema>;


export const usersCollection = db.collection<User>("users");
