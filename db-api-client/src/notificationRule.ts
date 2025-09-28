import { AxiosInstance } from 'axios';
// Assuming NotificationRule, NotificationRuleCreateData, NotificationRuleUpdateData, Filters, and MyRequestBody are defined in interfaces
import { NotificationRule, NotificationRuleCreateData, NotificationRuleUpdateData, Filters, MyRequestBody } from './interfaces';
import { BASE_PATH_NOTIFICATION_RULES } from './constants';
import { Logger } from 'winston';

/**
 * Fetches all notification rules visible to the calling user.
 * Uses POST to send role-based filters in the body payload.
 */
export const getAllNotificationRules = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string, // The ID of the user making the request (for auth context)
    filters: Filters<NotificationRule> = {} // Role-based authorization filters provided by backend
): Promise<NotificationRule[]> => {
    try {
        const payload: MyRequestBody<NotificationRule> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const url = `${apiClient.defaults.baseURL}${BASE_PATH_NOTIFICATION_RULES}`;
        logger.info(`Requesting all notification rules for context user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use POST to securely send the filters payload
        const response = await apiClient.post<NotificationRule[]>(`${BASE_PATH_NOTIFICATION_RULES}`, payload);
        logger.info(`Successfully fetched all notification rules for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch all notification rules for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Fetches a single notification rule by its ID.
 * Authorization context and filters are sent in the body payload.
 */
export const getNotificationRuleById = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    ruleId: string,
    filters: Filters<NotificationRule> = {} // Role-based authorization filters provided by backend
): Promise<NotificationRule> => {
    try {
        const payload: MyRequestBody<NotificationRule> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_NOTIFICATION_RULES}/${ruleId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Requesting notification rule with ID: ${ruleId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use POST to send the authorization context
        const response = await apiClient.post<NotificationRule>(path, payload);
        logger.info(`Successfully fetched notification rule with ID: ${ruleId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch notification rule with ID: ${ruleId} for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Creates a new notification rule.
 * The data payload is wrapped in MyRequestBody; filters are empty.
 */
export const createNotificationRule = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    ruleData: NotificationRuleCreateData
): Promise<NotificationRule> => {
    try {
        const payload: MyRequestBody<NotificationRule, NotificationRuleCreateData> = {
            userId: callingUserId,
            data: ruleData,
            filters: {} // No filters needed for a create operation
        };

        const path = `${BASE_PATH_NOTIFICATION_RULES}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Creating new notification rule for user: ${callingUserId} to URL: ${url}`);

        const response = await apiClient.post<NotificationRule>(path, payload);
        logger.info(`Successfully created a new notification rule for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to create a new notification rule for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Updates an existing notification rule.
 * Authorization filters are passed along with the update data.
 */
export const updateNotificationRule = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    ruleId: string,
    updateData: NotificationRuleUpdateData,
    filters: Filters<NotificationRule> = {} // Role-based authorization filters provided by backend
): Promise<NotificationRule> => {
    try {
        const payload: MyRequestBody<NotificationRule, NotificationRuleUpdateData> = {
            userId: callingUserId,
            data: updateData,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_NOTIFICATION_RULES}/${ruleId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Updating notification rule with ID: ${ruleId} for user: ${callingUserId} to URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use PUT to send the MyRequestBody payload
        const response = await apiClient.put<NotificationRule>(path, payload);
        logger.info(`Successfully updated notification rule with ID: ${ruleId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to update notification rule with ID: ${ruleId} for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Deletes a notification rule by its ID.
 * Authorization filters are sent in the body payload via Axios's delete config.
 */
export const deleteNotificationRule = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    ruleId: string,
    filters: Filters<NotificationRule> = {} // Role-based authorization filters provided by backend
): Promise<void> => {
    try {
        const payload: MyRequestBody<NotificationRule> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_NOTIFICATION_RULES}/${ruleId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Deleting notification rule with ID: ${ruleId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Axios's DELETE method supports sending a body via the 'data' config property
        await apiClient.delete(path, { data: payload });
        logger.info(`Successfully deleted notification rule with ID: ${ruleId} for user: ${callingUserId}`);
    } catch (error) {
        logger.error(`Failed to delete notification rule with ID: ${ruleId} for user: ${callingUserId}`, { error });
        throw error;
    }
};
