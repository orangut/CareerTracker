import {z} from "zod";
import {ObjectId} from "mongodb";

import {client} from "../config/mongoClient";
import {Stage, StageType, StatesOptions} from "./stage";


const MAX_OFFSET_MS = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks

const db = client.db("career-tracker");

export interface NotificationRule {
    _id?: ObjectId;             // MongoDB ObjectId
    name: string;
    userId: ObjectId;           // Reference to the user
    offsetMs: number;         // Offset in milliseconds (positive or negative)
    stageType: StageType
    stageField: keyof Stage;
    messageTemplate: string;
    isEnabled: boolean;
    createdAt: Date;          // Rule creation timestamp
    updatedAt: Date;          // Last update timestamp
}

export const NotificationRuleSchema = z.object({
    name: z.string().min(4, "Name is required at least 4 characters long"),
    userId: z.string().refine((val) => ObjectId.isValid(val), {
        message: "Invalid userId format"
    }).transform((id) => new ObjectId(id)),
    offsetMs: z.number()
        .refine(value => value >= -MAX_OFFSET_MS && value <= MAX_OFFSET_MS, {
            message: `offsetMs must be within ±4 weeks`
        })
        .refine(value => value % (30 * 60 * 1000) === 0, {
            message: "offsetMs must be in increments of 30 minutes"
        }),
    stageType: z.enum(StatesOptions),
    // TODO: verify stageField is a valid and date field of the stageType collection
    stageField: z.string().min(1, "stageField cannot be empty.") as z.ZodType<keyof Stage>,
    messageTemplate: z.string().min(1, "messageTemplate must be a string.") as z.ZodType<string>,
    isEnabled: z.boolean().default(true),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const NotificationRuleCreateSchema = NotificationRuleSchema.pick({
    name: true,
    userId: true,
    offsetMs: true,
    stageType: true,
    stageField: true,
    messageTemplate: true,
    isEnabled: true
})
export const NotificationRuleUpdateSchema = NotificationRuleCreateSchema.partial()

export type NotificationRuleCreateData = z.infer<typeof NotificationRuleCreateSchema>;
export type NotificationRuleUpdateData = z.infer<typeof NotificationRuleUpdateSchema>;


export const notificationRulesCollection = db.collection<NotificationRule>("notification_rules");
