export {User} from "@monorepo/mongo-api/src/models/user"
export {JobApplication} from "@monorepo/mongo-api/src/models/jobApplication"
export {Stage} from "@monorepo/mongo-api/src/models/stage"
export {NotificationRule} from "@monorepo/mongo-api/src/models/notificationRule"


export interface IsUserExists {
    exists: boolean;
}

export interface IsLoginSuccess {
    success: boolean;
    userId?: string;
    message?: string;
}
