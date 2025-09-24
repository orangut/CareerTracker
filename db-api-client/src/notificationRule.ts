import { AxiosInstance } from 'axios';
import { NotificationRule } from './interfaces';
import { BASE_PATH_NOTIFICATION_RULES } from './constants';

/**
 * Fetches all notification rules for a given user.
 */
export const getAllNotificationRules = (apiClient: AxiosInstance) => async (
    userId: string
): Promise<NotificationRule[]> => {
    const response = await apiClient.get<NotificationRule[]>(`${BASE_PATH_NOTIFICATION_RULES}`, {
        params: { userId },
    });
    return response.data;
};

/**
 * Fetches a single notification rule by its ID.
 */
export const getNotificationRuleById = (apiClient: AxiosInstance) => async (
    userId: string,
    ruleId: string
): Promise<NotificationRule> => {
    const response = await apiClient.get<NotificationRule>(`${BASE_PATH_NOTIFICATION_RULES}/${ruleId}`, {
        params: { userId },
    });
    return response.data;
};

/**
 * Creates a new notification rule.
 */
export const createNotificationRule = (apiClient: AxiosInstance) => async (
    userId: string,
    ruleData: any
): Promise<NotificationRule> => {
    const payload = { ...ruleData, userId };
    const response = await apiClient.post<NotificationRule>(`${BASE_PATH_NOTIFICATION_RULES}`, payload);
    return response.data;
};

/**
 * Updates an existing notification rule.
 */
export const updateNotificationRule = (apiClient: AxiosInstance) => async (
    userId: string,
    ruleId: string,
    updateData: any
): Promise<NotificationRule> => {
    const payload = { ...updateData, userId };
    const response = await apiClient.put<NotificationRule>(`${BASE_PATH_NOTIFICATION_RULES}/${ruleId}`, payload);
    return response.data;
};

/**
 * Deletes a notification rule by its ID.
 */
export const deleteNotificationRule = (apiClient: AxiosInstance) => async (
    userId: string,
    ruleId: string
): Promise<void> => {
    await apiClient.delete(`${BASE_PATH_NOTIFICATION_RULES}/${ruleId}`, {
        params: { userId },
    });
};
