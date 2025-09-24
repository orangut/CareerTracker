// src/middleware/validateJobApplication.ts

import {NextFunction, Request, Response} from "express";
import {ObjectId} from "mongodb";
import {JobApplication, jobApplicationsCollection} from "../models/jobApplication";
import {ValidatedUserExistsRequest} from "./validateUser";


export interface ValidatedJobExistsRequest extends Request {
    validatedJobApplication?: JobApplication;
}


export const validateJobApplicationExists = async (req: ValidatedUserExistsRequest, res: Response, next: NextFunction) => {
    try {
        // FIXME: req.params.id is for jobApplication routes. req.body?.jobApplicationId || req.query.jobApplicationId are for stage routes.
        // We might want to split this middleware into two separate ones for clarity.
        const jobApplicationId: string = req.body?.jobApplicationId || req.query.jobApplicationId || req.params.jobId;

        if (jobApplicationId === undefined || jobApplicationId === null) {
            return res.status(400).json({error: "jobApplicationId is required"});
        }

        if (!ObjectId.isValid(jobApplicationId)) {
            return res.status(400).json({error: "Invalid jobApplicationId: must be a valid ObjectId"});
        }

        // Find the job application by both its ID AND the user's ID
        const jobAppObjectId = new ObjectId(jobApplicationId);
        const jobApplication = await jobApplicationsCollection.findOne({
            _id: jobAppObjectId,
            userId: req?.validatedUser?._id
        });

        if (!jobApplication) {
            // Use 404 to avoid revealing whether the ID exists or is just not owned by the user
            return res.status(404).json({error: "Job application not found or unauthorized."});
        }

        // If validation passes, attach the document to the request for the handler to use
        (req as ValidatedJobExistsRequest).validatedJobApplication = jobApplication;
        next();
    } catch (err) {
        console.error("Error in validateJobApplication middleware:", err);
        return res.status(500).json({error: "Internal server error during validation."});
    }
};
