import {Router} from "express";
import {ObjectId} from "mongodb";
import {stagesCollection} from "../models/stage";
import {ValidatedJobExistsRequest, validateJobApplicationExists} from "../middleware/validateJobApplication";

const stageRouter = Router();

// Create Stage
stageRouter.post("/", validateJobApplicationExists, async (req: ValidatedJobExistsRequest, res) => {
    try {
        const jobApplicationId = req.validatedJobApplication?._id;

        const data = {...req.body, createdAt: new Date(), updatedAt: new Date(), jobApplicationId};
        const result = await stagesCollection.insertOne(data);

        // TODO: fix the swagger method to return the complete object instead of just id
        const newStage = {
            _id: result.insertedId,
            ...data
        };

        res.status(201).json(newStage);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to create stage"});
    }
});

// Get all stages for a jobApplication
stageRouter.get("/job/:jobId", validateJobApplicationExists, async (req: ValidatedJobExistsRequest, res) => {
    try {
        const jobApplicationId = req.validatedJobApplication?._id;
        const stages = await stagesCollection.find({jobApplicationId: jobApplicationId}).sort({startedAt: -1}).toArray();

        res.json(stages);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch stages"});
    }
});

// Update stage
stageRouter.put("/:id", validateJobApplicationExists, async (req: ValidatedJobExistsRequest, res) => {
    try {
        const id = new ObjectId(req.params.id as string);
        const jobApplicationId = req.validatedJobApplication?._id;

        const update = {...req.body, updatedAt: new Date()};

        const result = await stagesCollection.updateOne({_id: new ObjectId(id), jobApplicationId}, {$set: update});

        if (result.matchedCount === 0) return res.status(404).json({error: "Not found"});
        res.json({message: "Updated successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to update stage"});
    }
});

// Delete stage
stageRouter.delete("/:id", validateJobApplicationExists, async (req: ValidatedJobExistsRequest, res) => {
    try {
        const id = req.params.id;
        const jobApplicationId = req.validatedJobApplication?._id;

        const result = await stagesCollection.deleteOne({_id: new ObjectId(id), jobApplicationId});
        if (result.deletedCount === 0) return res.status(404).json({error: "Not found"});

        res.json({message: "Deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete stage"});
    }
});

export default stageRouter;
