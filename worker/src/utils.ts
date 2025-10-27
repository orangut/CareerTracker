import {NotificationRule} from './config/dbClient';
import {Stage, ScheduledNotification} from './interfaces';
import logger from "./config/logger";


/**
 * Calculate trigger time based on rule and job application
 **/
export function calculateTriggerTime(
    rule: NotificationRule,
    stage: Stage
): number | null {
    // if (!rule.isActive) return null;

    if (!(rule.stageField in stage)) return null;

    // Expect to get an ISO string
    const stageField = stage[rule.stageField] as string;

    const stageFieldDate = new Date(stageField)
    if (isNaN(stageFieldDate.getTime())) {
        logger.error('Failed to process or convert stage field to a valid date.', {
            stageField,
        });
        return null;
    }

    return stageFieldDate.getTime() + rule.offsetMs;
}


/**
 * Create a notification object
 */
export function createNotification(
    userId: string,
    rule: NotificationRule,
    stage: Stage,
    triggerTime: number
): ScheduledNotification {
    return {
        id: `${rule._id}_${stage._id}`,
        userId,
        ruleId: rule._id?.toString() || '',
        stageId: stage._id?.toString() || '',
        triggerTime,
        // message: rule.message,
    };
}
