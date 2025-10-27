import { type JobApplication } from "../models/JobApplication.ts";

// Helper function for status chip styles
export const getStatusChipStyles = (status: JobApplication['lastStageType']) => {
    switch (status) {
        case 'applied':
            return { bgcolor: 'rgba(0, 150, 255, 0.1)', color: 'info.dark' }; // Blue
        case 'phone_screen':
            return { bgcolor: 'rgba(150, 0, 150, 0.1)', color: 'secondary.dark' }; // Purple
        case 'technical_interview':
            return { bgcolor: 'rgba(255, 165, 0, 0.1)', color: 'warning.dark' }; // Orange
        case 'final_interview':
        case 'offer':
            return { bgcolor: 'rgba(0, 128, 0, 0.1)', color: 'success.dark' }; // Green
        case 'rejected':
        case 'withdrawn':
            return { bgcolor: 'rgba(255, 0, 0, 0.1)', color: 'error.dark' }; // Red
        default:
            return { bgcolor: 'grey.200', color: 'grey.800' };
    }
};

// Helper function for job type chip styles
export const getRemoteOptionChipStyles = (remoteOption: JobApplication['remoteOption']) => {
    switch (remoteOption) {
        case 'remote':
            return { bgcolor: 'rgba(0, 128, 0, 0.1)', color: 'success.dark' };
        case 'hybrid':
            return { bgcolor: 'rgba(0, 0, 255, 0.1)', color: 'primary.dark' };
        case 'onsite':
            return { bgcolor: 'rgba(128, 0, 128, 0.1)', color: 'secondary.dark' };
        default:
            return { bgcolor: 'grey.200', color: 'grey.800' };
    }
};

// Helper function to format dates
export const formatDate = (date: Date | string, withTime: boolean = false): string => {
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    if (withTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
    }
    const formattedDate = new Date(date).toLocaleDateString(
        'en-US',
        dateOptions
    );
    return formattedDate;
}

export const getSalaryString = (salaryMin?: number | undefined, salaryMax?: number | undefined): string => {
    return `${salaryMin !== undefined ? `${salaryMin.toString()}k$` : '?'} - ${salaryMax !== undefined ? `${salaryMax}k$` : '?'}`
}

export const checkIfDate = (value: any): boolean => {
    return (value instanceof Date && !isNaN(value.getTime())) || ((typeof value == 'string') && !isNaN(Date.parse(value)));
}