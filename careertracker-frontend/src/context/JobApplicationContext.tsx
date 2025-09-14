import { createContext, useReducer, useContext, type ReactNode } from 'react';
import { type JobApplication } from '../models/JobApplication';

// Types
interface JobApplicationState {
    jobApplications: JobApplication[];
}

type JobApplicationAction =
    | { type: 'CREATE'; payload: JobApplication }
    | { type: 'UPDATE'; payload: JobApplication }
    | { type: 'DELETE'; payload: string };

export interface JobApplicationContextType {
    jobApplications: JobApplication[];
    createJobApplication: (job: JobApplication) => void;
    readJobApplication: (id: string) => JobApplication | undefined;
    updateJobApplication: (job: JobApplication) => void;
    deleteJobApplication: (id: string) => void;
}

// Reducer
function jobApplicationReducer(state: JobApplicationState, action: JobApplicationAction): JobApplicationState {
    switch (action.type) {
        case 'CREATE':
            return { jobApplications: [...state.jobApplications, action.payload] };
        case 'UPDATE':
            return {
                jobApplications: state.jobApplications.map(job => job.id === action.payload.id ? action.payload : job)
            };
        case 'DELETE':
            return {
                jobApplications: state.jobApplications.filter(job => job.id !== action.payload)
            };
        default:
            return state;
    }
}

// Context
const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

// Provider
export const JobApplicationProvider = ({ children, initialJobApplications = [] }: { children: ReactNode; initialJobApplications?: JobApplication[] }) => {
    const [state, dispatch] = useReducer(jobApplicationReducer, { jobApplications: initialJobApplications });

    // CRUD actions
    const createJobApplication = (jobApplication: JobApplication) => dispatch({ type: 'CREATE', payload: jobApplication });
    const updateJobApplication = (jobApplication: JobApplication) => dispatch({ type: 'UPDATE', payload: jobApplication });
    const deleteJobApplication = (id: string) => dispatch({ type: 'DELETE', payload: id });
    const readJobApplication = (id: string) => state.jobApplications.find(job => job.id === id);

    return (
        <JobApplicationContext.Provider value={{ jobApplications: state.jobApplications, createJobApplication, readJobApplication, updateJobApplication, deleteJobApplication }}>
            {children}
        </JobApplicationContext.Provider>
    );
};

// Hook for easy access
export const useJobApplications = () => {
    const context = useContext(JobApplicationContext);
    if (!context) {
        throw new Error('useJobApplications must be used within a JobApplicationProvider');
    }
    return context;
};
