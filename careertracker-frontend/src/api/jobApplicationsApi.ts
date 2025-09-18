import axiosClient from './axiosClient';
import { type JobApplication } from '../models/JobApplication';

const BASE_URL = "/job-applications"

export const createJobApplication = async (applicationData: Omit<JobApplication, 'id'>): Promise<JobApplication> => {
    const response = await axiosClient.post<JobApplication>(BASE_URL, applicationData);
    return response.data;
};

export const getJobApplications = async (): Promise<JobApplication[]> => {
    const response = await axiosClient.get<JobApplication[]>(BASE_URL);
    return response.data;
};

export const updateJobApplication = async (jobApplication: JobApplication): Promise<JobApplication> => {
    const response = await axiosClient.put<JobApplication>(`${BASE_URL}/${jobApplication.id}`, jobApplication);
    return response.data;
};

export const deleteJobApplication = async (id: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/${id}`);
};