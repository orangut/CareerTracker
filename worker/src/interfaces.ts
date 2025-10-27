export {
    NotificationRule, Stage
} from "@monorepo/db-api-client/src/interfaces"

export type operationType = 'CREATE' | 'DELETE'
export type transactionType = 'Stage' | 'Rule'

export interface Transaction {
    transactionType: transactionType;
    operation: operationType;
    userId: string;
    objectId: string;
}

export interface ScheduledNotification {
    id: string;
    userId: string;
    stageId: string;
    ruleId: string;
    triggerTime: number;
    // message: string;
}

export interface NotificationQueue {
    queueJobId: string;
    stageId: string;
    ruleId: string;
}