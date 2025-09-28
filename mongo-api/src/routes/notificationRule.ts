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
    try {
        // 1. Validate request body data using the specific creation schema
        const parseInputResult = NotificationRuleCreateSchema.safeParse(req.body.data);
        if (!parseInputResult.success) {
            logger.warn(`Failed to create notification rule due to validation error: ${parseInputResult.error.issues}. UserId: ${req.body.userId}`);
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

        logger.info(`Successfully created new notification rule with ID: ${result.insertedId} for user: ${notificationRuleData.userId}. UserId: ${req.body.userId}`);
        res.status(201).json(newNotificationRule);
    } catch (err) {
        logger.error(`Error creating notification rule. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to create notification rule"});
    }
});

// Get all notification rules for user
notificationRuleRouter.get("/", async (req: GetRuleReq, res: Response) => {
    try {
        // Use req.body.filters to ensure only the authenticated user's rules are returned
        const rules = await notificationRulesCollection.find(req.body.filters || {}).toArray();
        logger.info(`Successfully fetched all notification rules. UserId: ${req.body.userId}`);
        res.json(rules);
    } catch (err) {
        logger.error(`Error fetching notification rules. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to fetch notification rules"});
    }
});

// Get single notification rule by ID
notificationRuleRouter.get("/:id", validateObjectId, async (req: GetRuleReq, res: Response) => {
    try {
        const ruleIdObject = new ObjectId(req.params.id as string);

        // Lookup the rule using the provided ID combined with body filters (ensuring ownership)
        const rule = await notificationRulesCollection.findOne({...req.body.filters, _id: ruleIdObject});

        if (!rule) {
            logger.warn(`Notification rule ${req.params.id} not found or unauthorized. UserId: ${req.body.userId}.`);
            return res.status(404).json({error: `Notification rule ${req.params.id} not found or unauthorized.`});
        }

        logger.info(`Successfully fetched notification rule with ID: ${rule._id}. UserId: ${req.body.userId}`);
        res.json(rule);
    } catch (err) {
        logger.error(`Error fetching notification rule with ID ${req.params.id}. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to fetch notification rule"});
    }
});

// Update notification rule
notificationRuleRouter.put("/:id", validateObjectId, async (req: UpdateRuleReq, res: Response) => {
    try {
        const ruleIdObject = new ObjectId(req.params.id as string);
        const {id} = req.params;

        // 1. Validate request body data against the partial update schema
        const parseResult = NotificationRuleUpdateSchema.safeParse(req.body.data);
        if (!parseResult.success) {
            logger.warn(`Failed to update notification rule ${id} due to validation error: ${parseResult.error.issues}. UserId: ${req.body.userId}`);
            return res.status(400).json({error: parseResult.error.issues});
        }

        const updateData = parseResult.data;
        const updatedAt = new Date();

        // 2. Prepare update payload: $set includes validated data and the new timestamp
        const update = {...updateData, updatedAt};

        // 3. Perform the update and get the updated document
        // We use req.body.filters to ensure the user owns the rule being updated
        const updateNotificationRuleResult = await notificationRulesCollection.findOneAndUpdate(
            {...req.body.filters, _id: ruleIdObject},
            {$set: update},
            {returnDocument: 'after'}
        );

        if (!updateNotificationRuleResult) {
            logger.warn(`NotificationRule with ID ${id} not found for update or unauthorized. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found"});
        }

        logger.info(`Successfully updated notification rule with ID: ${id} for user: ${updateNotificationRuleResult.userId}. UserId: ${req.body.userId}`);
        res.json(updateNotificationRuleResult);
    } catch (err) {
        logger.error(`Error updating notification rule with ID ${req.params.id}. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to update notification rule"});
    }
});

// Delete notification rule
notificationRuleRouter.delete("/:id", validateObjectId, async (req: DeleteRuleReq, res: Response) => {
    try {
        const ruleIdObject = new ObjectId(req.params.id as string);
        const {id} = req.params;

        // Use req.body.filters combined with _id to ensure the user owns the rule
        const result = await notificationRulesCollection.deleteOne({...req.body.filters, _id: ruleIdObject});

        if (result.deletedCount === 0) {
            logger.warn(`Notification rule with ID ${id} not found for deletion or unauthorized. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found or unauthorized"});
        }

        logger.info(`Successfully deleted notification rule with ID: ${id}. UserId: ${req.body.userId}`);
        res.json({message: "Deleted successfully"});
    } catch (err) {
        logger.error(`Error deleting notification rule with ID ${req.params.id}. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to delete notification rule"});
    }
});

export default notificationRuleRouter;
