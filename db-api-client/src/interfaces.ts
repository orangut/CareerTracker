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
export type Filters<F> = Partial<F>;

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
