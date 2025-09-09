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


class JobApplication {
    id: string;
    company: string;
    position: string;
    location: string;
    applicationDate: Date | string;
    interestLevel: AllInterestLevelsType;
    currentStage: AllStagesType;
    salaryRange?: string;
    remoteOption: AllRemoteOptionsType;
    jobUrl: string;
    isEdit: boolean;
    stages?: string[];

    constructor(data: JobApplication) {
        this.id = data.id;
        this.company = data.company;
        this.position = data.position;
        this.location = data.location;
        this.applicationDate = new Date(data.applicationDate); // Convert string to Date object TODO: applied current date.
        this.interestLevel = data.interestLevel;
        this.currentStage = data.currentStage; // TODO: Initial with default stage, when there will be a timeline of stages.
        this.salaryRange = data.salaryRange;
        this.remoteOption = data.remoteOption;
        this.jobUrl = data.jobUrl;
        this.isEdit = data.isEdit;
        this.stages = []; // TODO: create array of stages component
    }

    // public getFormattedDate(): string {
    //     const dateOptions = {year: 'numeric', month: 'short', day: 'numeric'} as Intl.DateTimeFormatOptions;
    //     return this.applicationDate.toLocaleDateString('en-US', dateOptions);
    // }
}

export default JobApplication