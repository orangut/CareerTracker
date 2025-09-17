// AddApplicationPage.tsx
import {useNavigate} from 'react-router-dom';
import {useJobApplications} from '../context/JobApplicationContext';
import {type JobApplication} from '../models/JobApplication';
import JobApplicationForm from '../components/JobApplicationForm';

const AddApplicationPage = () => {
    const {createJobApplication} = useJobApplications();
    const navigate = useNavigate();

    const handleSubmit = async (jobData: Omit<JobApplication, 'id' | 'isEdit'>) => {
        try {
            await createJobApplication(jobData);
            navigate('/');
        } catch (error) {
            // TODO: Handle any errors that occur during the creation process
            console.error('Failed to create job application:', error);
        }
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