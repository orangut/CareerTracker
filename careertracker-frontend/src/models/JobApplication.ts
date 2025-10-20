import type { Stage } from "./stage";

export const allStages = [
    'applied',
    'phone_screen',
    'technical_interview',
    'final_interview',
    'offer',
    'rejected',
    'withdrawn',
] as const;

export const allInterestLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const allRemoteOptions = ['remote', 'hybrid', 'onsite'] as const;

export type AllStagesType = typeof allStages[number];
export type AllInterestLevelsType = typeof allInterestLevels[number];
export type AllRemoteOptionsType = typeof allRemoteOptions[number];


export type JobApplication = {
    _id: string;
    userId: string;
    company: string;
    position: string;
    location: string;
    applicationDate: Date | string;
    interestLevel: AllInterestLevelsType;
    lastStageType: AllStagesType;
    salaryMin?: number;
    salaryMax?: number;
    remoteOption: AllRemoteOptionsType;
    jobUrl: string;
    isEdit: boolean;
    notes?: string[];
    stages?: Stage[];
}
