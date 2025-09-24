import axios, {AxiosInstance} from 'axios';
import {
    createJobApplication,
    deleteJobApplication,
    getAllJobApplications,
    getJobApplicationById,
    updateJobApplication
} from './jobApplication';
import {createStage, deleteStage, getAllStages, getStageById, updateStage} from './stage';
import {
    createNotificationRule,
    deleteNotificationRule,
    getAllNotificationRules,
    getNotificationRuleById,
    updateNotificationRule
} from './notificationRule';
import {
    authenticateUser,
    createUserProfile,
    deleteUserProfile,
    getByUsername,
    getUserById, getUsers,
    updateUserProfile
} from './user';
import {IsLoginSuccess, IsUserExists, JobApplication, NotificationRule, Stage, User} from './interfaces';
import {isUserExists, login, register} from "./auth";


// A wrapper function to handle common API request logic and error handling
const handleApiRequest = async <T>(request: Promise<T>): Promise<T | null> => {
    try {
        return await request;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error('API request failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * The core client object that provides access to all API functions.
 * Functions are wrapped to automatically pass the apiClient instance.
 */
const dbApiClient = (db_api_url?: string) => {
    // Initialize the Axios client with shared configuration
    const DB_API_URL = db_api_url || process.env.DB_API_URL;

    if (!DB_API_URL) {
        throw new Error("DB_API_URL must be provided (argument or env variable).");
    }

    const apiClient: AxiosInstance = axios.create({
        baseURL: DB_API_URL,
        headers: {'Content-Type': 'application/json'},
    });

    return {
        jobApplications: {
            getAll: async (userId: string): Promise<JobApplication[] | null> => handleApiRequest(
                getAllJobApplications(apiClient)(userId)
            ),
            getById: async (userId: string, applicationId: string): Promise<JobApplication | null> => handleApiRequest(
                getJobApplicationById(apiClient)(userId, applicationId)
            ),
            create: async (userId: string, appData: any): Promise<JobApplication | null> => handleApiRequest(
                createJobApplication(apiClient)(userId, appData)
            ),
            update: async (userId: string, applicationId: string, updateData: any): Promise<JobApplication | null> => handleApiRequest(
                updateJobApplication(apiClient)(userId, applicationId, updateData)
            ),
            delete: async (userId: string, applicationId: string): Promise<void | null> => handleApiRequest(
                deleteJobApplication(apiClient)(userId, applicationId)
            ),
        },
        stages: {
            getAll: async (jobApplicationId: string): Promise<Stage[] | null> => handleApiRequest(
                getAllStages(apiClient)(jobApplicationId)
            ),
            getById: async (stageId: string): Promise<Stage | null> => handleApiRequest(
                getStageById(apiClient)(stageId)
            ),
            create: async (stageData: any): Promise<Stage | null> => handleApiRequest(
                createStage(apiClient)(stageData)
            ),
            update: async (stageId: string, updateData: any): Promise<Stage | null> => handleApiRequest(
                updateStage(apiClient)(stageId, updateData)
            ),
            delete: async (stageId: string): Promise<void | null> => handleApiRequest(
                deleteStage(apiClient)(stageId)
            ),
        },
        notificationRules: {
            getAll: async (userId: string): Promise<NotificationRule[] | null> => handleApiRequest(
                getAllNotificationRules(apiClient)(userId)
            ),
            getById: async (userId: string, ruleId: string): Promise<NotificationRule | null> => handleApiRequest(
                getNotificationRuleById(apiClient)(userId, ruleId)
            ),
            create: async (userId: string, ruleData: any): Promise<NotificationRule | null> => handleApiRequest(
                createNotificationRule(apiClient)(userId, ruleData)
            ),
            update: async (userId: string, ruleId: string, updateData: any): Promise<NotificationRule | null> => handleApiRequest(
                updateNotificationRule(apiClient)(userId, ruleId, updateData)
            ),
            delete: async (userId: string, ruleId: string): Promise<void | null> => handleApiRequest(
                deleteNotificationRule(apiClient)(userId, ruleId)
            ),
        },
        users: {
            get: async (): Promise<User[] | null> => handleApiRequest(
                getUsers(apiClient)()
            ),
            getById: async (userId: string): Promise<User | null> => handleApiRequest(
                getUserById(apiClient)(userId)
            ),
            getByUsername: async (username: string): Promise<User | null> => handleApiRequest(
                getByUsername(apiClient)(username)
            ),
            create: async (profileData: any): Promise<User | null> => handleApiRequest(
                createUserProfile(apiClient)(profileData)
            ),
            update: async (userId: string, profileData: any): Promise<User | null> => handleApiRequest(
                updateUserProfile(apiClient)(userId, profileData)
            ),
            delete: async (userId: string): Promise<void | null> => handleApiRequest(
                deleteUserProfile(apiClient)(userId)
            ),
            authenticate: async (username: string, hashedPassword: string): Promise<string | null> => handleApiRequest(
                authenticateUser(apiClient)(username, hashedPassword)
            ),
        },
        auth: {
            isUserExists: async (username: string): Promise<boolean | null> => handleApiRequest(
                isUserExists(apiClient)(username)
            ),
            register: async (username: string, hashedPassword: string): Promise<User | null> => handleApiRequest(
                register(apiClient)(username, hashedPassword)
            ),
            login: async (username: string, password: string): Promise<string | null> => handleApiRequest(
                login(apiClient)(username, password)
            ),
        }
    }
};

export default dbApiClient;
