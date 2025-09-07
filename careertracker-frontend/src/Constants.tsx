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

export interface JobApplication {
    id: string;
    company: string;
    position: string;
    location: string;
    application_date: string;
    interest_level: AllInterestLevelsType;
    current_stage: AllStagesType;
    salary_range?: string;
    remote_option: AllRemoteOptionsType;
    job_url: string;
    isEdit?: boolean;
}

export const jobData: Array<JobApplication> = [
    // Mock 1: A standard, applied job
    {
        id: '1',
        company: 'Innovate Solutions Inc.',
        position: 'Data Analyst',
        location: 'New York, NY',
        application_date: '2024-11-20',
        interest_level: 4.5,
        current_stage: 'applied',
        salary_range: '$75k - $90k',
        remote_option: 'onsite',
        isEdit: true,
        job_url: 'https://www.innovatesolutions.com/jobs/data-analyst-1',
    },

    // Mock 2: A remote job in the technical interview stage
    {
        id: '2',
        company: 'Cybernetics Corp.',
        position: 'Backend Developer',
        location: 'Remote',
        application_date: '2024-11-15',
        interest_level: 5,
        current_stage: 'technical_interview',
        salary_range: '$110k - $140k',
        remote_option: 'remote',
        isEdit: true,
        job_url: 'https://www.cybernetics.com/jobs/backend-dev-2',
    },

    // Mock 3: A job in the phone screen stage with no salary info
    {
        id: '3',
        company: 'Creative Studio',
        position: 'UI/UX Designer',
        location: 'Chicago, IL',
        application_date: '2024-11-10',
        interest_level: 3,
        current_stage: 'phone_screen',
        salary_range: undefined,
        remote_option: 'hybrid',
        isEdit: true,
        job_url: 'https://www.creativestudio.com/jobs/designer-3',
    },

    // Mock 4: A rejected application with a lower interest level
    {
        id: '4',
        company: 'Legacy Systems',
        position: 'Systems Administrator',
        location: 'Austin, TX',
        application_date: '2024-10-30',
        interest_level: 2,
        current_stage: 'rejected',
        salary_range: '$80k - $100k',
        remote_option: 'onsite',
        isEdit: true,
        job_url: 'https://www.legacysystems.com/jobs/sysadmin-4',
    },

    // Mock 5: An application with an offer and high interest
    {
        id: '5',
        company: 'Quantum Dynamics',
        position: 'Quantum Engineer',
        location: 'San Jose, CA',
        application_date: '2024-11-25',
        interest_level: 5,
        current_stage: 'offer',
        salary_range: '$180k - $220k',
        remote_option: 'hybrid',
        isEdit: true,
        job_url: 'https://www.quantumdynamics.com/jobs/quantum-eng-5',
    },
];
