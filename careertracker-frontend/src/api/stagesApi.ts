import type { PartialStage } from '../components/StageFormDialog';
import type { Stage } from '../models/stage';
import axiosClient from './axiosClient';

const BASE_URL = "/stage"

export const createStage = async (jobApplicationId: string, stageData: PartialStage): Promise<Stage> => {
    const response = await axiosClient.post<Stage>(`${BASE_URL}`, { jobApplicationId, ...stageData });
    return response.data;
}

export const updateStage = async (stageId: string, jobApplicationId: string, stageData: PartialStage): Promise<Stage> => {
    const response = await axiosClient.put<Stage>(`${BASE_URL}/${stageId}`, { jobApplicationId, ...stageData });
    return response.data;
}
