// notificationRuleApi.ts

import axiosClient from './axiosClient';
import {
    type NotificationRule,
    type RuleFrontend,
    type RuleData,
    msToHalfHours,
    halfHoursToMs
} from "../models/NotificationRule.ts";

const BASE_URL = "/notification-rule";

/**
 * Converts frontend rule format (with offsetHalfHours) to backend format (with offsetMs)
 */
const ruleToBackend = (rule: NotificationRule): Omit<RuleData, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string } => {
    // Import the conversion function from models

    return {
        ...(rule._id && { _id: rule._id }),
        userId: rule.userId,
        name: rule.name,
        stageType: rule.stageType,
        stageField: rule.stageField,
        messageTemplate: rule.messageTemplate,
        isEnabled: rule.isEnabled,
        offsetMs: halfHoursToMs(rule.offsetHalfHours),
    };
};

/**
 * Converts backend rule format to frontend format
 */
const ruleToFrontend = (rule: RuleData): RuleFrontend => {
    return {
        _id: rule._id,
        userId: rule.userId,
        name: rule.name,
        stageType: rule.stageType,
        stageField: rule.stageField,
        messageTemplate: rule.messageTemplate,
        isEnabled: rule.isEnabled,
        offsetHalfHours: msToHalfHours(rule.offsetMs),
        createdAt: new Date(rule.createdAt),
        updatedAt: new Date(rule.updatedAt),
    };
};

/**
 * Creates a new notification rule.
 * Converts offsetHalfHours to offsetMs before sending to backend.
 */
export const createNotificationRule = async (ruleData: Omit<NotificationRule, '_id'>) => {
    const backendData = ruleToBackend(ruleData as NotificationRule);
    const response = await axiosClient.post<RuleData>(BASE_URL, backendData);

    return {
        ...response,
        data: ruleToFrontend(response.data)
    };
};

/**
 * Fetches all notification rules for the current user.
 * Converts offsetMs to offsetHalfHours for frontend display.
 */
export const getNotificationRules = async () => {
    const response = await axiosClient.get<RuleData[]>(BASE_URL);

    return {
        ...response,
        data: response.data.map(rule => ruleToFrontend(rule))
    };
};

/**
 * Updates an existing notification rule.
 * Converts offsetHalfHours to offsetMs before sending to backend.
 */
export const updateNotificationRule = async (ruleData: NotificationRule) => {
    if (!ruleData._id) {
        throw new Error('Rule ID is required for updates');
    }

    const backendData = ruleToBackend(ruleData);
    const response = await axiosClient.put<RuleData>(`${BASE_URL}/${ruleData._id}`, backendData);

    return {
        ...response,
        data: ruleToFrontend(response.data)
    };
};

/**
 * Deletes a notification rule by ID.
 */
export const deleteNotificationRule = async (id: string) => {
    return await axiosClient.delete(`${BASE_URL}/${id}`);
};