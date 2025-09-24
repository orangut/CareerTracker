import { AxiosInstance } from 'axios';
import { Stage } from './interfaces';
import { BASE_PATH_STAGES } from './constants';

/**
 * Fetches all stages for a given job application.
 */
export const getAllStages = (apiClient: AxiosInstance) => async (
    jobApplicationId: string
): Promise<Stage[]> => {
    const response = await apiClient.get<Stage[]>(`${BASE_PATH_STAGES}`, {
        params: { jobApplicationId },
    });
    return response.data;
};

/**
 * Fetches a single stage by its ID.
 */
export const getStageById = (apiClient: AxiosInstance) => async (
    stageId: string
): Promise<Stage> => {
    const response = await apiClient.get<Stage>(`${BASE_PATH_STAGES}/${stageId}`);
    return response.data;
};

/**
 * Creates a new stage for a job application.
 */
export const createStage = (apiClient: AxiosInstance) => async (
    stageData: any
): Promise<Stage> => {
    const response = await apiClient.post<Stage>(`${BASE_PATH_STAGES}`, stageData);
    return response.data;
};

/**
 * Updates an existing stage.
 */
export const updateStage = (apiClient: AxiosInstance) => async (
    stageId: string,
    updateData: any
): Promise<Stage> => {
    const response = await apiClient.put<Stage>(`${BASE_PATH_STAGES}/${stageId}`, updateData);
    return response.data;
};

/**
 * Deletes a stage by its ID.
 */
export const deleteStage = (apiClient: AxiosInstance) => async (
    stageId: string
): Promise<void> => {
    await apiClient.delete(`${BASE_PATH_STAGES}/${stageId}`);
};
