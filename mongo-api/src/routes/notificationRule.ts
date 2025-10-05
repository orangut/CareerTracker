import {Response, Router} from "express";
import {ObjectId} from "mongodb";
import {
    NotificationRule,
    NotificationRuleCreateData,
    NotificationRuleCreateSchema,
    notificationRulesCollection,
    NotificationRuleUpdateData,
    NotificationRuleUpdateSchema,
} from "../models/notificationRule";

import logger from '../config/logger';
import {MyRequestType} from '../types';
import {validateObjectId} from "../middleware/validateObjectId";

const notificationRuleRouter = Router();

// --- TYPE ALIASES (F=NotificationRule, D=DataPayload) ---
// Use MyRequestType<FilterType, DataType>
type CreateRuleReq = MyRequestType<NotificationRule, NotificationRuleCreateData>;
type GetRuleReq = MyRequestType<NotificationRule>;
type UpdateRuleReq = MyRequestType<NotificationRule, NotificationRuleUpdateData>;
type DeleteRuleReq = MyRequestType<NotificationRule>;


// Create Notification Rule
notificationRuleRouter.post("/", async (req: CreateRuleReq, res: Response) => {
    const userId = req.authContext?.userId;
    const data = req.authContext?.data;

    try {
        // 1. Validate request body data using the specific creation schema
        const parseInputResult = NotificationRuleCreateSchema.safeParse(data);
        if (!parseInputResult.success) {
            logger.warn(`Failed to create notification rule due to validation error: ${parseInputResult.error.issues}. UserId: ${userId}`);
            return res.status(400).json({error: parseInputResult.error.issues});
        }

        const ruleData = parseInputResult.data;
        const now = new Date();

        // 2. Build the full document for insertion (including server-managed fields)
        // The spread of ruleData automatically brings in 'offsetMs'
        const notificationRuleData: Omit<NotificationRule, '_id'> = {
            ...ruleData,
            createdAt: now,
            updatedAt: now,
        } as Omit<NotificationRule, '_id'>;

        // 3. Insert into collection
        const result = await notificationRulesCollection.insertOne(notificationRuleData as NotificationRule);
        const newNotificationRule: NotificationRule = {
            _id: result.insertedId,
            ...notificationRuleData
        };

        logger.info(`Successfully created new notification rule with ID: ${result.insertedId} for user: ${notificationRuleData.userId}. UserId: ${userId}`);
        res.status(201).json(newNotificationRule);
    } catch (err) {
        logger.error(`Error creating notification rule. UserId: ${userId}: ${err}`);
        res.status(500).json({error: "Failed to create notification rule"});
    }
});

// Get all notification rules for user
notificationRuleRouter.get("/", async (req: GetRuleReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    try {
        // Use filters to ensure only the authenticated user's rules are returned
        const rules = await notificationRulesCollection.find(filters || {}).toArray();
        logger.info(`Successfully fetched all notification rules. UserId: ${userId}`);
        return res.json(rules);
    } catch (err) {
        logger.error(`Error fetching notification rules. UserId: ${userId}: ${err}`);
        return res.status(500).json({error: "Failed to fetch notification rules"});
    }
});

// Get single notification rule by ID
notificationRuleRouter.get("/:id", validateObjectId, async (req: GetRuleReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    const {id} = req.params
    const ruleIdObject = new ObjectId(id as string);
    try {

        // Lookup the rule using the provided ID combined with body filters (ensuring ownership)
        const rule = await notificationRulesCollection.findOne({...filters, _id: ruleIdObject});

        if (!rule) {
            logger.warn(`Notification rule ${id} not found or unauthorized. UserId: ${userId}.`);
            return res.status(404).json({error: `Notification rule ${id} not found or unauthorized.`});
        }

        logger.info(`Successfully fetched notification rule with ID: ${rule._id}. UserId: ${userId}`);
        return res.json(rule);
    } catch (err) {
        logger.error(`Error fetching notification rule with ID ${id}. UserId: ${userId}: ${err}`);
        return res.status(500).json({error: "Failed to fetch notification rule"});
    }
});

// Update notification rule
notificationRuleRouter.put("/:id", validateObjectId, async (req: UpdateRuleReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;
    const data = req.authContext?.data;

    const {id} = req.params;
    const ruleIdObject = new ObjectId(id as string);

    try {
        // 1. Validate request body data against the partial update schema
        const parseResult = NotificationRuleUpdateSchema.safeParse(data);
        if (!parseResult.success) {
            logger.warn(`Failed to update notification rule ${id} due to validation error: ${parseResult.error.issues}. UserId: ${userId}`);
            return res.status(400).json({error: parseResult.error.issues});
        }

        const updateData = parseResult.data;
        const updatedAt = new Date();

        // 2. Prepare update payload: $set includes validated data and the new timestamp
        const update = {...updateData, updatedAt};

        // 3. Perform the update and get the updated document
        // We use filters to ensure the user owns the rule being updated
        const updateNotificationRuleResult = await notificationRulesCollection.findOneAndUpdate(
            {...filters, _id: ruleIdObject},
            {$set: update},
            {returnDocument: 'after'}
        );

        if (!updateNotificationRuleResult) {
            logger.warn(`NotificationRule with ID ${id} not found for update or unauthorized. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }

        logger.info(`Successfully updated notification rule with ID: ${id} for user: ${updateNotificationRuleResult.userId}. UserId: ${userId}`);
        return res.json(updateNotificationRuleResult);
    } catch (err) {
        logger.error(`Error updating notification rule with ID ${id}. UserId: ${userId}: ${err}`);
        return res.status(500).json({error: "Failed to update notification rule"});
    }
});

// Delete notification rule
notificationRuleRouter.delete("/:id", validateObjectId, async (req: DeleteRuleReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    const {id} = req.params;
    const ruleIdObject = new ObjectId(id as string);

    try {

        // Use filters combined with _id to ensure the user owns the rule
        const result = await notificationRulesCollection.deleteOne({...filters, _id: ruleIdObject});

        if (result.deletedCount === 0) {
            logger.warn(`Notification rule with ID ${id} not found for deletion or unauthorized. UserId: ${userId}`);
            return res.status(404).json({error: "Not found or unauthorized"});
        }

        logger.info(`Successfully deleted notification rule with ID: ${id}. UserId: ${userId}`);
        return res.json({message: "Deleted successfully"});
    } catch (err) {
        logger.error(`Error deleting notification rule with ID ${id}. UserId: ${userId}: ${err}`);
        return res.status(500).json({error: "Failed to delete notification rule"});
    }
});

export default notificationRuleRouter;
