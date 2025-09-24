import { Router } from "express";
import { ObjectId } from "mongodb";
import { notificationRulesCollection, NotificationRuleSchema } from "../models/notificationRule";
import { usersCollection } from "../models/user"; // <-- Add this import
import { ValidatedUserExistsRequest, validateUserExists } from "../middleware/validateUser";

const notificationRuleRouter = Router();

// Create Notification Rule
notificationRuleRouter.post("/", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;

        const data = { ...req.body, userId, createdAt: new Date(), updatedAt: new Date() };
        const parseResult = NotificationRuleSchema.safeParse(data);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.issues });
        }
        const result = await notificationRulesCollection.insertOne(data);

        // TODO: fix the swagger method to return the complete object instead of just id
        const newNotificationRule = {
            _id: result.insertedId,
            ...data
        };

        res.status(201).json(newNotificationRule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create notification rule" });
    }
});

// Get all notification rules for user
notificationRuleRouter.get("/", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const rules = await notificationRulesCollection.find({ userId }).toArray();
        res.json(rules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notification rules" });
    }
});

// Get single notification rule by ID
notificationRuleRouter.get("/:id", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const id = req.params.id;
        const rule = await notificationRulesCollection.findOne({ _id: new ObjectId(id), userId });
        if (!rule) return res.status(404).json({ error: "Not found" });
        res.json(rule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notification rule" });
    }
});

// Update notification rule
notificationRuleRouter.put("/:id", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id;
        const id = req.params.id;
        
        const update = { ...req.body, updatedAt: new Date() };
        const parseResult = NotificationRuleSchema.safeParse(update);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.issues });
        }
        const result = await notificationRulesCollection.updateOne(
            { _id: new ObjectId(id), userId },
            { $set: update }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: "Not found or unauthorized" });
        res.json({ message: "Updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update notification rule" });
    }
});

// Delete notification rule
notificationRuleRouter.delete("/:id", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const userId = req.validatedUser?._id
        const id = req.params.id;
        const result = await notificationRulesCollection.deleteOne({ _id: new ObjectId(id), userId });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Not found or unauthorized" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete notification rule" });
    }
});

export default notificationRuleRouter;
