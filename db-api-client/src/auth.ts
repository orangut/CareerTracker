import {AxiosInstance} from 'axios';
import {IsLoginSuccess, IsUserExists, User} from './interfaces';
import {BASE_PATH_AUTH} from './constants';


/**
 * Check if user exists by username
 */
export const isUserExists = (apiClient: AxiosInstance) => async (
    username: string
): Promise<boolean> => {
    const response = await apiClient.get<IsUserExists>(`${BASE_PATH_AUTH}/exists/${username}`);
    return response.data.exists;
};


/**
 * Register
 */
export const register = (apiClient: AxiosInstance) => async (
    username: string,
    hashedPassword: string,
): Promise<User> => {
    const response = await apiClient.post<User>(`${BASE_PATH_AUTH}/register`, {username, hashedPassword});
    return response.data;
};


/**
 * Login
 */
export const login = (apiClient: AxiosInstance) => async (
    username: string,
    password: string
): Promise<string | null> => {
    try {
        const response = await apiClient.post<IsLoginSuccess>(`${BASE_PATH_AUTH}/auth`, {username, password});
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

