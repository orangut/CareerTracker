import logger from "../config/logger";
import {dbClient} from "../config/dbClient";
import {ScheduledNotification} from "../interfaces";
import {calculateTriggerTime, createNotification} from "../utils";


/**
 * Fetches notification rules or job applications based on the provided match key and value,
 * and generates a list of new ScheduledNotification objects.
 *
 * @param userId The ID of the user.
 * @param matchKey Determines the search type ('Rule' or 'Stage').
 * @param matchValue The ID or value to search by.
 * @returns A promise that resolves to an array of ScheduledNotification objects.
 */
export async function getNotificationsToCreate(
    userId: string,
    matchKey: string,
    matchValue: string
): Promise<ScheduledNotification[]> {
    let results: (ScheduledNotification | undefined)[] = [];

    if (matchKey === 'Stage') {
        const stageMatch = await dbClient.stages.getById(userId, matchValue)

        // 2. Find rules (mapping) based on the job's lastStage type
        if (stageMatch) {
            const matchedRules = await dbClient.notificationRules.getAll(userId, {stageType: stageMatch.type});

            if (matchedRules) {
                // Generate notifications: rule is the item, job is the single match
                results = matchedRules.map(rule => {
                    const triggerTime = calculateTriggerTime(rule, stageMatch);
                    if (triggerTime && triggerTime > Date.now()) {
                        return createNotification(userId, rule, stageMatch, triggerTime);
                    }
                    return undefined;
                });
            }
        }

    } else if (matchKey === 'Rule') {
        try {
            // 1. Find the rule (matching) based on the rule ID (matchValue)
            const ruleMatch = await dbClient.notificationRules.getById(userId, matchValue);

            // 2. Find stages (mapping) based on the rule's stage type
            if (ruleMatch?.stageType) {
                // Using the one-line filter for stage type as previously discussed
                const matchedStages = await dbClient.stages.getLastStages(userId, {type: ruleMatch.stageType});

                if (matchedStages) {
                    // Generate notifications: stage is the item, rule is the single match
                    results = matchedStages.map(stage => {
                        const triggerTime = calculateTriggerTime(ruleMatch, stage);
                        if (triggerTime && triggerTime > Date.now()) {
                            return createNotification(userId, ruleMatch, stage, triggerTime);
                        }
                        return undefined;
                    });
                }
            }
        } catch (error) {
            logger.error(`${error}`)
        }
    } else {
        logger.error(`${matchKey} is invalid`);
        throw new Error(`${matchKey} is invalid`);
    }

    // Filter out undefined values to return a clean ScheduledNotification[] array
    return results.filter((notification): notification is ScheduledNotification => !!notification);
}
