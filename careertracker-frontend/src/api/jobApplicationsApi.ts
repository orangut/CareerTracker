import axiosClient from './axiosClient';
import { type JobApplication } from '../models/JobApplication';

export const createJobApplication = async (applicationData: Omit<JobApplication, 'id'>): Promise<JobApplication> => {
    const response = await axiosClient.post<JobApplication>('/jobapplications', applicationData);
    return response.data;
};

export const getJobApplications = async (): Promise<JobApplication[]> => {
    const response = await axiosClient.get<JobApplication[]>('/jobapplications');
    return response.data;
};

export const updateJobApplication = async (jobApplication: JobApplication): Promise<JobApplication> => {
    const response = await axiosClient.put<JobApplication>(`/jobapplications/${jobApplication.id}`, jobApplication);
    return response.data;
};

export const deleteJobApplication = async (id: string): Promise<void> => {
    await axiosClient.delete(`/jobapplications/${id}`);
};