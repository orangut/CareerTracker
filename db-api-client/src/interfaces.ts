export {User, UserCreateData, UserUpdateData} from "@monorepo/mongo-api/src/models/user"
export {
    JobApplication, JobApplicationPopulatedStage, JobApplicationCreateData, JobApplicationUpdateData
} from "@monorepo/mongo-api/src/models/jobApplication"
export {Stage, StageCreateData, StageUpdateData} from "@monorepo/mongo-api/src/models/stage"
export {
    NotificationRule, NotificationRuleCreateData, NotificationRuleUpdateData
} from "@monorepo/mongo-api/src/models/notificationRule"


export interface IsUserExists {
    exists: boolean;
}

export interface IsLoginSuccess {
    success: boolean;
    userId?: string;
    message?: string;
}

/**
 * Filters must only contain keys that exist on the generic type F.
 */
type ObjectId = any; // Example: if your types use 'mongoose.Types.ObjectId'

/**
 * Maps over the properties of F, converting any property
 * whose type is ObjectId to string. The result is Partial.
 */
export type Filters<F> = Partial<{
    [K in keyof F]: F[K] extends ObjectId
        ? string // If the property is ObjectId, make it a string
        : F[K];   // Otherwise, keep the original type
}>;

/**
 * Wrapper for all requests sent to the Mongo API service.
 * F is the type being filtered (e.g., User, JobApplication).
 * D is the data payload for mutations (e.g., UserCreateData).
 */
export interface MyRequestBody<F, D = undefined> {
    filters?: Filters<F>;
    data?: D;
    userId: string; // The ID of the user context making the request
}
