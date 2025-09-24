// src/middleware/validateUser.ts

import { Request, Response, NextFunction } from "express";
import { User, usersCollection } from "../models/user";
import { ObjectId } from "mongodb";


export interface ValidatedUserExistsRequest extends Request {
    validatedUser?: User;
}


export const validateUserExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdString: string = req.body?.userId || req.query.userId || req.params.userId;
        
        if (userIdString === undefined || userIdString === null) {
            return res.status(400).json({ error: "userId is required" });
        }

        if (!ObjectId.isValid(userIdString)) {
            return res.status(400).json({error: "Invalid userId: must be a valid ObjectId" });
        }

        const userId = new ObjectId(userIdString);
        const user = await usersCollection.findOne({ _id: userId });
        if (!user) {
            return res.status(400).json({ error: "Invalid userId: user does not exist" });
        }

        // If the user exists, attach the validated user object to the request
        // for later use and pass control to the next middleware or route handler.
        (req as ValidatedUserExistsRequest).validatedUser = user;
        next();
    } catch (err) {
        console.error("Error in validateUser middleware:", err);
        return res.status(500).json({ error: "Internal server error during user validation" });
    }
};