import {AxiosInstance} from 'axios';
// Assuming Stage, StageCreateData, StageUpdateData, Filters, and MyRequestBody are defined in interfaces
import {Filters, MyRequestBody, Stage, StageCreateData, StageUpdateData} from './interfaces';
import {BASE_PATH_STAGES} from './constants';
import {Logger} from 'winston';


/**
 * Fetches all stages visible to the calling user.
 */
export const getAllLastStages = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    filters: Filters<Stage> = {} // Role-based authorization filters provided by backend
): Promise<Stage[]> => {
    try {
        const url = `${BASE_PATH_STAGES}/last-stages`;

        // Prepare query parameters
        const params = {
            userId: callingUserId,
            // Filters must be stringified to be safely transmitted in the URL
            filters: JSON.stringify(filters)
        };
        logger.info(`Requesting all stages for user: ${callingUserId}. Filters: ${JSON.stringify(filters)}`);

        // Use GET and pass parameters in the config object
        const response = await apiClient.get<Stage[]>(url, {params});
        logger.info(`Successfully fetched all job applications for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch all job applications for user: ${callingUserId}`, {error});
        throw error;
    }
}

/**
 * Fetches a single stage by its ID.
 */
export const getStageById = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    stageId: string,
    filters: Filters<Stage> = {} // Role-based authorization filters provided by backend
): Promise<Stage> => {
    try {
        // Construct query parameters for the GET request
        const params = {
            userId: callingUserId,
            // Stringify complex filters for safe transmission in the URL query string
            filters: JSON.stringify(filters)
        };

        const path = `${BASE_PATH_STAGES}/${stageId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Requesting stage with ID: ${stageId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use GET to send the parameters via query string
        const response = await apiClient.get<Stage>(path, {params});

        logger.info(`Successfully fetched stage with ID: ${stageId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch stage with ID: ${stageId} for user: ${callingUserId}`, {error});
        throw error;
    }
};

/**
 * Creates a new stage for a job application.
 * Filters are empty, but the data payload is wrapped in MyRequestBody.
 */
export const createStage = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    stageData: StageCreateData
): Promise<Stage> => {
    try {
        const payload: MyRequestBody<Stage, StageCreateData> = {
            userId: callingUserId,
            data: stageData,
            filters: {} // No filters needed for a create operation
        };

        const path = `${BASE_PATH_STAGES}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Creating new stage for user: ${callingUserId} to URL: ${url}`);

        const response = await apiClient.post<Stage>(path, payload);
        logger.info(`Successfully created a new stage for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to create a new stage for user: ${callingUserId}`, {error});
        throw error;
    }
};

/**
 * Updates an existing stage.
 * Authorization filters are passed along with the update data.
 */
export const updateStage = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    stageId: string,
    updateData: StageUpdateData,
    filters: Filters<Stage> = {} // Role-based authorization filters provided by backend
): Promise<Stage> => {
    try {
        const payload: MyRequestBody<Stage, StageUpdateData> = {
            userId: callingUserId,
            data: updateData,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_STAGES}/${stageId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Updating stage with ID: ${stageId} for user: ${callingUserId} to URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use PUT to send the MyRequestBody payload
        const response = await apiClient.put<Stage>(path, payload);
        logger.info(`Successfully updated stage with ID: ${stageId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to update stage with ID: ${stageId} for user: ${callingUserId}`, {error});
        throw error;
    }
};

/**
 * Deletes a stage by its ID.
 * Authorization filters are sent in the body payload via Axios's delete config.
 */
export const deleteStage = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    stageId: string,
    filters: Filters<Stage> = {} // Role-based authorization filters provided by backend
): Promise<void> => {
    try {
        const payload: MyRequestBody<Stage> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_STAGES}/${stageId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Deleting stage with ID: ${stageId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Axios's DELETE method supports sending a body via the 'data' config property
        await apiClient.delete(path, {data: payload});
        logger.info(`Successfully deleted stage with ID: ${stageId} for user: ${callingUserId}`);
    } catch (error) {
        logger.error(`Failed to delete stage with ID: ${stageId} for user: ${callingUserId}`, {error});
        throw error;
    }
};
