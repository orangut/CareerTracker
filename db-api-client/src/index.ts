import axios, {AxiosInstance} from 'axios';
import {Logger} from 'winston';

import {
    createJobApplication,
    deleteJobApplication,
    getAllJobApplications,
    getJobApplicationById,
    updateJobApplication
} from './jobApplication';
import {
    createStage,
    deleteStage,
    getAllStages,
    getAllStagesByJobApplicationId,
    getStageById,
    updateStage
} from './stage';
import {
    createNotificationRule,
    deleteNotificationRule,
    getAllNotificationRules,
    getNotificationRuleById,
    updateNotificationRule
} from './notificationRule';
import {createUserProfile, deleteUserProfile, getByUsername, getUserById, getUsers, updateUserProfile} from './user';
import {
    Filters,
    JobApplication,
    JobApplicationCreateData,
    JobApplicationPopulatedStage,
    JobApplicationUpdateData,
    NotificationRule,
    NotificationRuleCreateData,
    NotificationRuleUpdateData,
    Stage,
    StageCreateData,
    StageUpdateData,
    User,
    UserCreateData,
    UserUpdateData
} from './interfaces';
import {isUserExists, login, register} from "./auth";


// A wrapper function to handle common API request logic and error handling
const handleApiRequest = async <T>(request: Promise<T>): Promise<T | null> => {
    try {
        return await request;
    } catch (error: any) {
        // Handle 404 (Not Found) specifically, treating it as a successful null return
        if (error.response?.status === 404) {
            return null;
        }
        // Log other errors and re-throw them
        console.error('API request failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * The core client object that provides access to all API functions.
 * Functions are wrapped to automatically pass the apiClient instance and handle error wrapping.
 */
const dbApiClient = (db_api_url: string, optionalLogger: Logger) => {
    // Initialize the Axios client with shared configuration
    const DB_API_URL = db_api_url
    const logger = optionalLogger

    if (!DB_API_URL) {
        throw new Error("DB_API_URL must be provided (argument or env variable).");
    }

    const apiClient: AxiosInstance = axios.create({
        baseURL: DB_API_URL,
        headers: {'Content-Type': 'application/json'},
    });

    return {
        jobApplications: {
            getAll: async (callingUserId: string, filters: Filters<JobApplication> = {}): Promise<JobApplicationPopulatedStage[] | null> => handleApiRequest(
                getAllJobApplications(apiClient, logger)(callingUserId, filters)
            ),
            getById: async (callingUserId: string, applicationId: string, filters: Filters<JobApplication> = {}): Promise<JobApplicationPopulatedStage | null> => handleApiRequest(
                getJobApplicationById(apiClient, logger)(callingUserId, applicationId, filters)
            ),
            create: async (callingUserId: string, appData: JobApplicationCreateData): Promise<JobApplication | null> => handleApiRequest(
                createJobApplication(apiClient, logger)(callingUserId, appData)
            ),
            update: async (callingUserId: string, applicationId: string, updateData: JobApplicationUpdateData, filters: Filters<JobApplication> = {}): Promise<JobApplicationPopulatedStage | null> => handleApiRequest(
                updateJobApplication(apiClient, logger)(callingUserId, applicationId, updateData, filters)
            ),
            delete: async (callingUserId: string, applicationId: string, filters: Filters<JobApplication> = {}): Promise<void | null> => handleApiRequest(
                deleteJobApplication(apiClient, logger)(applicationId, callingUserId, filters)
            ),
        },
        stages: {
            getAll: async (callingUserId: string, filters: Filters<Stage> = {}): Promise<Stage[] | null> => handleApiRequest(
                getAllStages(apiClient, logger)(callingUserId, filters)
            ),
            getAllByJobApplicationId: async (callingUserId: string, jobApplicationId: string, filters: Filters<Stage> = {}): Promise<Stage[] | null> => handleApiRequest(
                getAllStagesByJobApplicationId(apiClient, logger)(callingUserId, jobApplicationId, filters)
            ),
            getById: async (callingUserId: string, stageId: string, filters: Filters<Stage> = {}): Promise<Stage | null> => handleApiRequest(
                getStageById(apiClient, logger)(callingUserId, stageId, filters)
            ),
            create: async (callingUserId: string, stageData: StageCreateData): Promise<Stage | null> => handleApiRequest(
                createStage(apiClient, logger)(callingUserId, stageData)
            ),
            update: async (callingUserId: string, stageId: string, updateData: StageUpdateData, filters: Filters<Stage> = {}): Promise<Stage | null> => handleApiRequest(
                updateStage(apiClient, logger)(callingUserId, stageId, updateData, filters)
            ),
            delete: async (callingUserId: string, stageId: string, filters: Filters<Stage> = {}): Promise<void | null> => handleApiRequest(
                deleteStage(apiClient, logger)(callingUserId, stageId, filters)
            ),
        },
        notificationRules: {
            getAll: async (callingUserId: string, filters: Filters<NotificationRule> = {}): Promise<NotificationRule[] | null> => handleApiRequest(
                getAllNotificationRules(apiClient, logger)(callingUserId, filters)
            ),
            getById: async (callingUserId: string, ruleId: string, filters: Filters<NotificationRule> = {}): Promise<NotificationRule | null> => handleApiRequest(
                getNotificationRuleById(apiClient, logger)(callingUserId, ruleId, filters)
            ),
            create: async (callingUserId: string, ruleData: NotificationRuleCreateData): Promise<NotificationRule | null> => handleApiRequest(
                createNotificationRule(apiClient, logger)(callingUserId, ruleData)
            ),
            update: async (callingUserId: string, ruleId: string, updateData: NotificationRuleUpdateData, filters: Filters<NotificationRule> = {}): Promise<NotificationRule | null> => handleApiRequest(
                updateNotificationRule(apiClient, logger)(callingUserId, ruleId, updateData, filters)
            ),
            delete: async (callingUserId: string, ruleId: string, filters: Filters<NotificationRule> = {}): Promise<void | null> => handleApiRequest(
                deleteNotificationRule(apiClient, logger)(callingUserId, ruleId, filters)
            ),
        },
        users: {
            getAll: async (callingUserId: string, filters: Filters<User> = {}): Promise<User[] | null> => handleApiRequest(
                getUsers(apiClient, logger)(callingUserId, filters)
            ),
            getById: async (targetUserId: string, callingUserId: string, filters: Filters<User> = {}): Promise<User | null> => handleApiRequest(
                getUserById(apiClient, logger)(targetUserId, callingUserId, filters)
            ),
            getByUsername: async (username: string, callingUserId: string, filters: Filters<User> = {}): Promise<User | null> => handleApiRequest(
                getByUsername(apiClient, logger)(username, callingUserId, filters)
            ),
            create: async (profileData: UserCreateData, callingUserId: string): Promise<User | null> => handleApiRequest(
                createUserProfile(apiClient, logger)(profileData, callingUserId)
            ),
            update: async (targetUserId: string, profileData: UserUpdateData, callingUserId: string, filters: Filters<User> = {}): Promise<User | null> => handleApiRequest(
                updateUserProfile(apiClient, logger)(targetUserId, profileData, callingUserId, filters)
            ),
            delete: async (targetUserId: string, callingUserId: string, filters: Filters<User> = {}): Promise<void | null> => handleApiRequest(
                deleteUserProfile(apiClient, logger)(targetUserId, callingUserId, filters)
            ),
        },
        auth: {
            isUserExists: async (username: string): Promise<boolean | null> => handleApiRequest(
                isUserExists(apiClient, logger)(username)
            ),
            register: async (username: string, hashedPassword: string): Promise<User | null> => handleApiRequest(
                register(apiClient, logger)(username, hashedPassword)
            ),
            login: async (username: string, password: string): Promise<string | null> => handleApiRequest(
                login(apiClient, logger)(username, password)
            ),
        }
    }
};

export default dbApiClient;
