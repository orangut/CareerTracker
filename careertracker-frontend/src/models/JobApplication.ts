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

export const allInterestLevels = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export const allRemoteOptions = ['remote', 'hybrid', 'onsite'] as const;

export type AllStagesType = typeof allStages[number];
export type AllInterestLevelsType = typeof allInterestLevels[number];
export type AllRemoteOptionsType = typeof allRemoteOptions[number];


export type JobApplication = {
    id: string;
    company: string;
    position: string;
    location: string;
    applicationDate: Date | string;
    interestLevel: AllInterestLevelsType;
    currentStage: AllStagesType;
    salaryMin?: number;
    salaryMax?: number;
    remoteOption: AllRemoteOptionsType;
    jobUrl: string;
    isEdit: boolean;
    notes?: string[];
    stages?: Stage[];
}
