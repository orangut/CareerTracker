import { AxiosInstance } from 'axios';
// Assuming JobApplication, JobApplicationCreateData, JobApplicationUpdateData, Filters, MyRequestBody, and JobApplicationPopulatedStage are defined in interfaces
import {
    JobApplication,
    JobApplicationPopulatedStage,
    Filters,
    MyRequestBody,
    JobApplicationCreateData,
    JobApplicationUpdateData,
    Stage
} from './interfaces';
import { BASE_PATH_JOB_APPLICATION } from "./constants";
import { Logger } from 'winston';


/**
 * Creates a new job application.
 * The data payload is wrapped in MyRequestBody; filters are empty.
 */
export const createJobApplication = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string, // Context user ID for auth
    appData: JobApplicationCreateData // Specific type for creation data
): Promise<JobApplication> => {
    try {
        const payload: MyRequestBody<JobApplication, JobApplicationCreateData> = {
            userId: callingUserId,
            data: appData,
            filters: {} // No filters needed for a create operation
        };

        const url = `${apiClient.defaults.baseURL}${BASE_PATH_JOB_APPLICATION}`;
        logger.info(`Creating new job application for user: ${callingUserId} to URL: ${url}.`);

        // Use POST to send the MyRequestBody payload
        const response = await apiClient.post<JobApplication>(BASE_PATH_JOB_APPLICATION, payload);
        logger.info(`Successfully created a new job application for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to create a new job application for user: ${callingUserId}`, { error });
        throw error;
    }
};


/**
 * Fetches all job applications visible to the calling user.
 * Uses POST to send role-based filters in the body payload.
 */
export const getAllJobApplications = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string, // The ID of the user making the request (for auth context)
    filters: Filters<JobApplication> = {} // Role-based authorization filters provided by backend
): Promise<JobApplicationPopulatedStage[] | null> => {
    try {
        const payload: MyRequestBody<JobApplication> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const url = `${apiClient.defaults.baseURL}${BASE_PATH_JOB_APPLICATION}`;
        logger.info(`Requesting all job applications for context user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use POST to securely send the filters payload
        const response = await apiClient.post<JobApplicationPopulatedStage[]>(BASE_PATH_JOB_APPLICATION, payload);
        logger.info(`Successfully fetched all job applications for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch all job applications for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Fetches a single job application by JobApplication ID.
 * Authorization context and filters are sent in the body payload.
 */
export const getJobApplicationById = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    applicationId: string,
    filters: Filters<JobApplication> = {} // Role-based authorization filters provided by backend
): Promise<JobApplicationPopulatedStage | null> => {
    try {
        const payload: MyRequestBody<JobApplication> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_JOB_APPLICATION}/${applicationId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Requesting job application with ID: ${applicationId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use POST to send the authorization context
        const response = await apiClient.post<JobApplicationPopulatedStage>(path, payload);
        logger.info(`Successfully fetched job application with ID: ${applicationId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch job application with ID: ${applicationId} for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Fetches all stages for a specific job application ID.
 * Authorization context and filters (used to check authorization on the parent application) are sent in the body payload.
 */
export const getStagesByJobApplicationId = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    applicationId: string,
    filters: Filters<JobApplication> = {} // Filters must check authorization on the PARENT resource (JobApplication)
): Promise<Stage[] | null> => {
    try {
        const payload: MyRequestBody<JobApplication> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_JOB_APPLICATION}/${applicationId}/stages`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Requesting stages for job application ID: ${applicationId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use POST to send the authorization context
        // The path reflects the nested RESTful route: /jobapplications/{id}/stages
        const response = await apiClient.post<Stage[]>(path, payload);
        logger.info(`Successfully fetched stages for job application ID: ${applicationId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch stages for job application ID: ${applicationId} for user: ${callingUserId}`, { error });
        throw error;
    }
};


/**
 * Updates an existing job application.
 * Authorization filters are passed along with the update data.
 */
export const updateJobApplication = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    applicationId: string,
    updateData: JobApplicationUpdateData, // Specific type for update data
    filters: Filters<JobApplication> = {} // Role-based authorization filters provided by backend
): Promise<JobApplicationPopulatedStage> => {
    try {
        const payload: MyRequestBody<JobApplication, JobApplicationUpdateData> = {
            userId: callingUserId,
            data: updateData,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_JOB_APPLICATION}/${applicationId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Updating job application with ID: ${applicationId} for user: ${callingUserId} to URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Use PUT to send the MyRequestBody payload
        const response = await apiClient.put<JobApplicationPopulatedStage>(path, payload);
        logger.info(`Successfully updated job application with ID: ${applicationId} for user: ${callingUserId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to update job application with ID: ${applicationId} for user: ${callingUserId}`, { error });
        throw error;
    }
};

/**
 * Deletes a job application by ID.
 * Authorization filters are sent in the body payload via Axios's delete config.
 */
export const deleteJobApplication = (apiClient: AxiosInstance, logger: Logger) => async (
    callingUserId: string,
    applicationId: string,
    filters: Filters<JobApplication> = {} // Role-based authorization filters provided by backend
): Promise<void> => {
    try {
        const payload: MyRequestBody<JobApplication> = {
            userId: callingUserId,
            filters: filters // Pass role-based filters
        };

        const path = `${BASE_PATH_JOB_APPLICATION}/${applicationId}`;
        const url = `${apiClient.defaults.baseURL}${path}`;
        logger.info(`Deleting job application with ID: ${applicationId} for user: ${callingUserId} from URL: ${url}. Filters: ${JSON.stringify(filters)}`);

        // Axios's DELETE method supports sending a body via the 'data' config property
        await apiClient.delete(path, { data: payload });
        logger.info(`Successfully deleted job application with ID: ${applicationId} for user: ${callingUserId}`);
    } catch (error) {
        logger.error(`Failed to delete job application with ID: ${applicationId} for user: ${callingUserId}`, { error });
        throw error;
    }
};
