import {AxiosInstance} from 'axios';
// Importing common types for consistency with other client files
import {IsLoginSuccess, IsUserExists, User} from './interfaces';
import {BASE_PATH_AUTH} from './constants';
import {Logger} from 'winston';


/**
 * Check if user exists by username.
 * This is a pre-authentication check and does not use the MyRequestBody structure.
 */
export const isUserExists = (apiClient: AxiosInstance, logger: Logger) => async (
    username: string
): Promise<boolean> => {
    try {
        const url = `${apiClient.defaults.baseURL}${BASE_PATH_AUTH}/exists/${username}`;
        logger.info(`Checking if user exists for username: ${username} from URL: ${url}`);
        // Using GET as this is a simple, unauthenticated read
        const response = await apiClient.get<IsUserExists>(`${BASE_PATH_AUTH}/exists/${username}`);
        logger.info(`Successfully checked for user existence for username: ${username}`);
        return response.data.exists;
    } catch (error) {
        logger.error(`Failed to check for user existence for username: ${username}`, {error});
        throw error;
    }
};


/**
 * Register
 * Creates a new user, requiring no existing userId or filters.
 */
export const register = (apiClient: AxiosInstance, logger: Logger) => async (
    username: string,
    hashedPassword: string,
): Promise<User> => {
    try {
        // Simple payload for registration, as user ID does not exist yet.
        const payload = {username, hashedPassword};
        const url = `${apiClient.defaults.baseURL}${BASE_PATH_AUTH}/register`;
        logger.info(`Registering new user: ${username} to URL: ${url}`);
        // Using POST with a simple payload
        const response = await apiClient.post<User>(`${BASE_PATH_AUTH}/register`, payload);
        logger.info(`Successfully registered new user: ${username}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to register user: ${username}`, {error});
        throw error;
    }
};


/**
 * Login
 * Authenticates a user, requiring no existing userId or filters.
 */
export const login = (apiClient: AxiosInstance, logger: Logger) => async (
    username: string,
    password: string
): Promise<string | null> => {
    try {
        // Simple payload for authentication, as user ID needs to be retrieved upon success.
        const payload = {username, password};
        const url = `${apiClient.defaults.baseURL}${BASE_PATH_AUTH}/auth`;
        logger.info(`Attempting login for user: ${username} to URL: ${url}`);
        const response = await apiClient.post<IsLoginSuccess>(`${BASE_PATH_AUTH}/auth`, payload);
        if (response.data.success && response.data.userId) {
            logger.info(`Successfully logged in user: ${username}`);
            return response.data.userId;
        } else {
            logger.warn(`Login failed for user: ${username} - Invalid credentials`);
            return null;
        }
    } catch (error) {
        logger.error(`Authentication failed for user: ${username}`, {error});
        throw error;
    }
};
