// src/models/jobApplication.ts
import {ObjectId} from "mongodb";
import {z} from "zod";

import {client} from "../config/mongoClient";
import {Stage} from "./stage";

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
    lastStageId?: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobApplicationPopulatedStage extends Omit<JobApplication, "lastStageId"> {
    lastStage?: Stage;
}

export const JobApplicationSchema = z.object({
    userId: z.string().refine((val) => ObjectId.isValid(val), {
        message: "Invalid UserId format"
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
    lastStageId: z.string()
        .refine((val) => ObjectId.isValid(val), {
            message: "Invalid StageId format"
        })
        .transform((id) => new ObjectId(id))
        .optional(),
    notes: z.array(z.string()).optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const JobApplicationCreateSchema = JobApplicationSchema.omit({
    lastStageId: true,
    createdAt: true,
    updatedAt: true,
})

// TypeScript type inference for POST request body data
export type JobApplicationCreateData = z.infer<typeof JobApplicationCreateSchema>;

export const JobApplicationUpdateSchema = JobApplicationCreateSchema.partial();

// TypeScript type inference for PUT request body data
export type JobApplicationUpdateData = z.infer<typeof JobApplicationUpdateSchema>;




export const jobApplicationsCollection = db.collection<JobApplication>("job_applications");
