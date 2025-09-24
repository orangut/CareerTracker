// src/models/stage.ts
import {z} from "zod";
import {ObjectId} from "mongodb";

import {client} from "../config/mongoClient";

const db = client.db("career-tracker");


export const StatesOptions = [
    'applied',
    'phone_screen',
    'technical_interview',
    'final_interview',
    'offer',
    'rejected',
    'withdrawn'
];

export type StageType = typeof StatesOptions[number];

export interface Stage {
    _id?: ObjectId;            // MongoDB ObjectId
    jobApplicationId: ObjectId; // Reference to JobApplication
    type: StageType;
    startedAt: Date;
    completedAt?: Date;       // Optional
    notes?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export const StageSchema = z.object({
    jobApplicationId: z.string().refine((val) => ObjectId.isValid(val), {
        message: "Invalid jobApplicationId format"
    }).transform((id) => new ObjectId(id)),
    type: z.enum(StatesOptions),
    startedAt: z.coerce.date(),
    completedAt: z.coerce.date().optional(),
    notes: z.array(z.string()).optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const stagesCollection = db.collection<Stage>("stages");
