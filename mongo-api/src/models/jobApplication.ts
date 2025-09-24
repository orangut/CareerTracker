// src/models/jobApplication.ts
import { ObjectId } from "mongodb";
import {z} from "zod";

import {client} from "../config/mongoClient";
import {Stage, StageSchema} from "./stage";

const db = client.db("career-tracker");

export type RemoteOption = 'remote' | 'hybrid' | 'onsite';

export interface JobApplication {
    _id?: ObjectId;
    userId: ObjectId;
    company: string;
    position: string;
    location: string;
    applicationDate: Date;
    interestLevel: number;
    salaryMin?: number;
    salaryMax?: number;
    remoteOption: RemoteOption;
    jobUrl: string;
    isEdit: boolean;
    notes?: string[];
    lastStage?: Stage;       // latest stage
    allStages?: Stage[];     // optional array of all stages (denormalized)
    createdAt: Date;
    updatedAt: Date;
}

export const JobApplicationSchema = z.object({
    userId: z.string().refine((val) => ObjectId.isValid(val), {
        message: "Invalid jobApplicationId format"
    }).transform((id) => new ObjectId(id)),
    company: z.string().min(1),
    position: z.string().min(1),
    location: z.string().min(1),
    applicationDate: z.coerce.date(),
    interestLevel: z.number().min(0).max(10),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    remoteOption: z.enum(['remote', 'hybrid', 'onsite']),
    jobUrl: z.url(),
    isEdit: z.boolean(),
    notes: z.array(z.string()).optional(),
    lastStage: StageSchema.optional(),
    allStages: z.array(StageSchema).optional(), // array of all stages
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const jobApplicationsCollection = db.collection<JobApplication>("job_applications");
