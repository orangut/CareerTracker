import { useEffect, createContext, useReducer, useContext, type ReactNode } from 'react';
import { createJobApplication as createJobApplicationAPI, getJobApplications, updateJobApplication as updateJobApplicationAPI, deleteJobApplication as deleteJobApplicationAPI } from '../api/jobApplicationsApi';
import { type JobApplication } from '../models/JobApplication';
import { useUser } from './UserContext';

// Types
interface JobApplicationState {
    jobApplications: JobApplication[];
}

type JobApplicationAction =
    | { type: 'LOAD_APPLICATIONS'; payload: JobApplication[] }
    | { type: 'CREATE'; payload: JobApplication }
    | { type: 'UPDATE'; payload: JobApplication }
    | { type: 'DELETE'; payload: string };

export interface JobApplicationContextType {
    jobApplications: JobApplication[];
    createJobApplication: (job: Omit<JobApplication, '_id' | 'userId'>) => Promise<void>;
    readJobApplication: (id: string) => JobApplication | undefined;
    updateJobApplication: (job: JobApplication) => Promise<void>;
    deleteJobApplication: (id: string) => Promise<void>;
}

// Reducer
function jobApplicationReducer(state: JobApplicationState, action: JobApplicationAction): JobApplicationState {
    switch (action.type) {
        case 'LOAD_APPLICATIONS':
            return { jobApplications: action.payload };
        case 'CREATE':
            return { jobApplications: [...state.jobApplications, action.payload] };
        case 'UPDATE':
            return {
                jobApplications: state.jobApplications.map(job => job._id === action.payload._id ? action.payload : job)
            };
        case 'DELETE':
            return {
                jobApplications: state.jobApplications.filter(job => job._id !== action.payload)
            };
        default:
            return state;
    }
}

// Context
const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

// Provider
export const JobApplicationProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: userLoading } = useUser();
    const [state, dispatch] = useReducer(jobApplicationReducer, { jobApplications: [] });

    useEffect(() => {
        const fetchApplications = async () => {
            if (user && user.id) {
                try {
                    const fetchedApps = await getJobApplications();
                    dispatch({ type: 'LOAD_APPLICATIONS', payload: fetchedApps });
                } catch (err: any) {
                    throw err;
                }
            } else {
                // If the user is not logged in, reset the state and do not show a loading screen
                dispatch({ type: 'LOAD_APPLICATIONS', payload: [] });
            }
        };

        if (!userLoading) {
            fetchApplications();
        }
    }, [user, userLoading]); // Dependency array includes 'user' to re-run on login/logout

    const createJobApplication = async (jobApplication: Omit<JobApplication, '_id' | 'userId'>) => {
        try {
            const newJob = await createJobApplicationAPI({ ...jobApplication, userId: user?.id! });
            dispatch({ type: 'CREATE', payload: newJob });
        } catch (err: any) {
            throw err;
        }
    };

    const updateJobApplication = async (jobApplication: JobApplication) => {
        try {
            const updatedJob = await updateJobApplicationAPI(jobApplication);
            dispatch({ type: 'UPDATE', payload: updatedJob });
        } catch (err: any) {
            throw err;
        }
    };

    const deleteJobApplication = async (id: string) => {
        try {
            await deleteJobApplicationAPI(id);
            dispatch({ type: 'DELETE', payload: id });
        } catch (err: any) {
            throw err;
        }
    };

    const readJobApplication = (id: string) => state.jobApplications.find(job => job._id.toString() === id);

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