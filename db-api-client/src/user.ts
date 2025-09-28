import {AxiosInstance} from 'axios';
// Assuming User, and specific data types are defined in interfaces
import {Filters, MyRequestBody, User, UserCreateData, UserUpdateData} from './interfaces';
import {BASE_PATH_USERS} from './constants';
import {Logger} from 'winston';


/**
 * Retrieves all the users visible to the calling user.
 * The backend service provides the 'filters' based on the user's role.
 */
export const getUsers = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string, // The ID of the user making the request (for auth context)
    filters: Filters<User> = {} // Role-based authorization filters provided by backend
): Promise<User[] | null> => {
    try {
        const payload: MyRequestBody<User> = {
            // The requesting user ID is mandatory for the Mongo API's security layer
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };
        const url = `${apiClient.defaults.baseURL}${BASE_PATH_USERS}`;
        logger.info(`Requesting all users from URL: ${url} with context user: ${callingUserId}. Filters: ${JSON.stringify(filters)}`);

        // Using POST to securely send the MyRequestBody payload (filters/context)
        const response = await apiClient.post<User[]>(`${BASE_PATH_USERS}`, payload);
        logger.info(`Successfully fetched all users.`);
        return response.data;
    } catch (error) {
        logger.error("Error fetching all users:", {error});
        return null;
    }
};

/**
 * Retrieves a user by their username using a generic query endpoint.
 * The primary lookup filter ({username}) is merged with role-based filters.
 */
export const getByUsername = (apiClient: AxiosInstance, logger: Logger) => async (
    username: string,
    callingUserId: string,
    authFilters: Filters<User> = {} // Role-based authorization filters provided by backend
): Promise<User | null> => {
    try {
        // We merge the required username lookup filter with the authorization filters
        const filters: Filters<User> = {...authFilters};
        const payload: MyRequestBody<User> = {
            userId: callingUserId,
            filters: filters
        };

        const queryPath = `${BASE_PATH_USERS}/username/${username}`;
        logger.info(`Requesting user by username: ${username} for context user: ${callingUserId}. Filters: ${JSON.stringify(filters)}`);

        // Using POST to carry the combined filter payload
        const response = await apiClient.post<User | null>(queryPath, payload);
        logger.info(`Successfully fetched user by username: ${username}`);
        return response.data;
    } catch (error) {
        logger.error(`Error fetching user by username: ${username}`, {error});
        return null;
    }
};

/**
 * Fetches user data by ID.
 * Authorization filters are sent in the body payload.
 */
export const getUserById = (apiClient: AxiosInstance, logger: Logger) => async (
    targetUserId: string, // The ID of the user to retrieve (sent in path)
    callingUserId: string,  // The ID of the user making the request (for auth context)
    filters: Filters<User> = {} // Role-based authorization filters provided by backend
): Promise<User> => {
    try {
        const payload: MyRequestBody<User> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_USERS}/${targetUserId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Requesting user by ID: ${targetUserId} from URL: ${url} with context user: ${callingUserId}. Filters: ${JSON.stringify(filters)}`);

        // Using POST to send the MyRequestBody payload
        const response = await apiClient.post<User>(path, payload);
        logger.info(`Successfully fetched user by ID: ${targetUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Error fetching user by ID: ${targetUserId}`, {error});
        throw error;
    }
};

/**
 * Creates a new user profile.
 * Sends role-based filters provided by the backend service.
 */
export const createUserProfile = (apiClient: AxiosInstance, logger: Logger) => async (
    profileData: UserCreateData, // Specific type for creation data
    callingUserId: string
): Promise<User> => {
    try {
        const payload: MyRequestBody<UserCreateData, UserCreateData> = {
            userId: callingUserId, // Context user ID for auth
            data: profileData,     // User data to be inserted
            filters: {} // No filters needed for a create operation
        };

        const path = `${BASE_PATH_USERS}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Creating new user profile to URL: ${url} with context user: ${callingUserId}.`);

        // POST request carries the MyRequestBody payload
        const response = await apiClient.post<User>(path, payload);
        logger.info(`Successfully created a new user profile.`);
        return response.data;
    } catch (error) {
        logger.error(`Error creating a new user profile.`, {error});
        throw error;
    }
};

/**
 * Updates a user's profile data.
 * Sends role-based filters provided by the backend service.
 */
export const updateUserProfile = (apiClient: AxiosInstance, logger: Logger) => async (
    targetUserId: string, // The ID of the user to update (sent in path)
    profileData: UserUpdateData, // Specific type for update data
    callingUserId: string,
    filters: Filters<User> = {} // Role-based authorization filters provided by backend
): Promise<User> => {
    try {
        const payload: MyRequestBody<User, UserUpdateData> = {
            userId: callingUserId, // Context user ID for auth
            data: profileData,     // Data to update
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_USERS}/${targetUserId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Updating user profile with ID: ${targetUserId} to URL: ${url} with context user: ${callingUserId}. Filters: ${JSON.stringify(filters)}`);

        // PUT request carries the MyRequestBody payload
        const response = await apiClient.put<User>(path, payload);
        logger.info(`Successfully updated user profile with ID: ${targetUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Error updating user profile with ID: ${targetUserId}`, {error});
        throw error;
    }
};

/**
 * Deletes a user's profile.
 * Sends role-based filters provided by the backend service.
 */
export const deleteUserProfile = (apiClient: AxiosInstance, logger: Logger) => async (
    targetUserId: string, // The ID of the user to delete (sent in path)
    callingUserId: string,
    filters: Filters<User> = {} // Role-based authorization filters provided by backend
): Promise<void> => {
    try {
        const payload: MyRequestBody<User> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_USERS}/${targetUserId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Deleting user profile with ID: ${targetUserId} from URL: ${url} with context user: ${callingUserId}. Filters: ${JSON.stringify(filters)}`);

        // Axios's DELETE method supports sending a body via the 'data' config property
        await apiClient.delete(path, {data: payload});
        logger.info(`Successfully deleted user profile with ID: ${targetUserId}`);
    } catch (error) {
        logger.error(`Error deleting user profile with ID: ${targetUserId}`, {error});
        throw error;
    }
};
