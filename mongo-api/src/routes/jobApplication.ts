import {Router} from "express";
import {ObjectId} from "mongodb";
import {jobApplicationsCollection} from "../models/jobApplication";
import {stagesCollection} from "../models/stage";
import {ValidatedUserExistsRequest, validateUserExists} from "../middleware/validateUser";
import {ValidatedJobExistsRequest, validateJobApplicationExists} from "../middleware/validateJobApplication";

const jobApplicationRoute = Router();

// Create Job Application
jobApplicationRoute.post("/", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;

        if (userId === undefined || userId === null) {
            return res.status(400).json({error: "userId is required"});
        }

        const data = {...req.body, userId, createdAt: new Date(), updatedAt: new Date()};
        const result = await jobApplicationsCollection.insertOne(data);

        // TODO: fix the swagger method to return the complete object instead of just id
        const newApplication = {
            _id: result.insertedId,
            ...data
        };

        res.status(201).json(newApplication);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to create job application"});
    }
});

// TODO: admin role can fetch all JobApplication
// Get all job applications for user
jobApplicationRoute.get("/", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const apps = await jobApplicationsCollection.find({userId}).toArray();

        const appsWithStages = await Promise.all(apps.map(async (app) => {
            const stages = await stagesCollection.find({jobApplicationId: app._id}).sort({startedAt: -1}).toArray();
            return {
                ...app,
                allStages: stages,
                lastStage: stages[0] || null
            };
        }));

        res.json(appsWithStages);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch job applications"});
    }
});

// Get single job application by ID
jobApplicationRoute.get("/:id", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const id = new ObjectId(req.params.id as string);
        const app = await jobApplicationsCollection.findOne({_id: id, userId});
        if (!app) return res.status(404).json({error: "Not found"});

        const stages = await stagesCollection.find({jobApplicationId: id}).sort({startedAt: -1}).toArray();
        res.json({...app, allStages: stages, lastStage: stages[0] || null});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch job application"});
    }
});

// Update job application
jobApplicationRoute.put("/:id", validateUserExists, validateJobApplicationExists, async (req: ValidatedJobExistsRequest & ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const id = req.validatedJobApplication?._id;

        const update = {...req.body, updatedAt: new Date()};

        const result = await jobApplicationsCollection.updateOne({_id: id, userId}, {$set: update});

        if (result.matchedCount === 0) return res.status(404).json({error: "Not found or unauthorized"});
        res.json({message: "Updated successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to update job application"});
    }
});

// Delete job application
jobApplicationRoute.delete("/:id", validateJobApplicationExists, async (req: ValidatedJobExistsRequest & ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const id = req.validatedJobApplication?._id;

        const result = await jobApplicationsCollection.deleteOne({_id: id, userId});
        if (result.deletedCount === 0) return res.status(404).json({error: "Not found or unauthorized"});

        // Delete related stages
        await stagesCollection.deleteMany({jobApplicationId: id});

        res.json({message: "Deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete job application"});
    }
});

export default jobApplicationRoute;
