import { AxiosInstance } from 'axios';
import { User } from './interfaces';
import { BASE_PATH_USERS } from './constants';


/**
 * Retrieves all the users.
 */
export const getUsers = (apiClient: AxiosInstance) => async (
): Promise<User[] | null> => {
    try {
        const response = await apiClient.get<User[]>(`${BASE_PATH_USERS}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        return null;
    }
};

/**
 * Retrieves a user by their username.
 */
export const getByUsername = (apiClient: AxiosInstance) => async (
    username: string
): Promise<User | null> => {
    try {
        const response = await apiClient.get<User>(`${BASE_PATH_USERS}/username/${username}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        return null;
    }
};

/**
 * Fetches user data by ID.
 */
export const getUserById = (apiClient: AxiosInstance) => async (
    userId: string
): Promise<User> => {
    const response = await apiClient.get<User>(`${BASE_PATH_USERS}/${userId}`);
    return response.data;
};

/**
 * Creates a new user profile.
 */
export const createUserProfile = (apiClient: AxiosInstance) => async (
    profileData: any
): Promise<User> => {
    const response = await apiClient.post<User>(`${BASE_PATH_USERS}`, profileData);
    return response.data;
};

/**
 * Updates a user's profile data.
 */
export const updateUserProfile = (apiClient: AxiosInstance) => async (
    userId: string,
    profileData: any
): Promise<User> => {
    const response = await apiClient.put<User>(`${BASE_PATH_USERS}/${userId}`, profileData);
    return response.data;
};

/**
 * Deletes a user's profile.
 */
export const deleteUserProfile = (apiClient: AxiosInstance) => async (
    userId: string
): Promise<void> => {
    await apiClient.delete(`${BASE_PATH_USERS}/${userId}`);
};

/**
 * Authenticates a user and returns the user ID on success.
 */
export const authenticateUser = (apiClient: AxiosInstance) => async (
    username: string,
    hashedPassword: string
): Promise<string | null> => {
    try {
        const response = await apiClient.post<{ success: boolean; userId?: string }>(
            `${BASE_PATH_USERS}/auth`,
            { username, hashedPassword }
        );
        if (response.data.success && response.data.userId) {
            return response.data.userId;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Authentication failed:', error);
        return null;
    }
};