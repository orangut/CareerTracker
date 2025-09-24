import { AxiosInstance } from 'axios';
import { JobApplication } from './interfaces';
import {BASE_PATH_JOB_APPLICATION} from "./constants";


/**
 * Creates a new job application.
 */
export const createJobApplication = (apiClient: AxiosInstance) => async (
    userId: string,
    appData: any
): Promise<JobApplication> => {
    const payload = { ...appData, userId };
    const response = await apiClient.post<JobApplication>(BASE_PATH_JOB_APPLICATION, payload);
    return response.data;
};


/**
 * Fetches all jobs application.
 */
export const getAllJobApplications = (apiClient: AxiosInstance) => async (
    userId: string
): Promise<JobApplication[] | null> => {
    const response = await apiClient.get<JobApplication[]>(BASE_PATH_JOB_APPLICATION, {
        params: { userId },
    });
    return response.data;
};

/**
 * Fetches a single job application by JobApplication ID.
 */
export const getJobApplicationById = (apiClient: AxiosInstance) => async (
    userId: string,
    applicationId: string
): Promise<JobApplication | null> => {
    const response = await apiClient.get<JobApplication>(`${BASE_PATH_JOB_APPLICATION}/${applicationId}`, {
        params: { userId },
    });
    return response.data;
};

/**
 * Updates an existing job application.
 */
export const updateJobApplication = (apiClient: AxiosInstance) => async (
    userId: string,
    applicationId: string,
    updateData: any
): Promise<JobApplication> => {
    const payload = { ...updateData, userId };
    const response = await apiClient.put<JobApplication>(`${BASE_PATH_JOB_APPLICATION}/${applicationId}`, payload);
    return response.data;
};

/**
 * Deletes a job application by ID.
 */
export const deleteJobApplication = (apiClient: AxiosInstance) => async (
    userId: string,
    applicationId: string
): Promise<void> => {
    // The DB API will likely use the userId for an ownership check
    await apiClient.delete(`${BASE_PATH_JOB_APPLICATION}/${applicationId}`, {
        params: { userId },
    });
};