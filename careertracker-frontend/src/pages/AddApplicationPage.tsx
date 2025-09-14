// AddApplicationPage.tsx
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useJobApplications } from '../context/JobApplicationContext';
import { type JobApplication } from '../models/JobApplication';
import JobApplicationForm from '../components/JobApplicationForm';

const AddApplicationPage = () => {
    const { createJobApplication } = useJobApplications();
    const navigate = useNavigate();

    const handleSubmit = (jobData: Omit<JobApplication, 'id' | 'isEdit'>) => {
        const newJob: JobApplication = {
            ...jobData,
            id: uuidv4(),
            isEdit: true,
        };

        createJobApplication(newJob);
        navigate('/');
    };

    return (
        <JobApplicationForm
            onSubmit={handleSubmit}
            onGoBackRoute="/"
            headerText="Add New Job Application"
            bodyText="Fill out the details for your new job application."
            buttonText="Add Application"
        />
    );
};

export default AddApplicationPage;