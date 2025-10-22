import axiosClient from './axiosClient';
import { type JobApplication } from '../models/JobApplication';
import type { Stage } from '../models/stage';

const BASE_URL = "/job-application"

export const createJobApplication = async (applicationData: Omit<JobApplication, '_id'>): Promise<JobApplication> => {
    const response = await axiosClient.post<JobApplication>(BASE_URL, applicationData);
    return response.data;
};

export const getJobApplications = async (): Promise<JobApplication[]> => {
    const response = await axiosClient.get<JobApplication[]>(BASE_URL);
    return response.data;
};

export const updateJobApplication = async (jobApplication: JobApplication): Promise<JobApplication> => {
    const response = await axiosClient.put<JobApplication>(`${BASE_URL}/${jobApplication._id}`, jobApplication);
    return response.data;
};

export const deleteJobApplication = async (id: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const getJobApplicationStages = async (jobApplicationId: string): Promise<Stage[]> => {
    const response = await axiosClient.get<Stage[]>(`${BASE_URL}/${jobApplicationId}/stages`);
    return response.data;
};
