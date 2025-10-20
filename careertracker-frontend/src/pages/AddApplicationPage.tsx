import { useJobApplications } from '../context/JobApplicationContext';
import { type JobApplication } from '../models/JobApplication';
import JobApplicationForm from '../components/JobApplicationForm';

const AddApplicationPage = () => {
    const { createJobApplication } = useJobApplications();

    return (
        <JobApplicationForm
            onSubmit={async (jobData: Omit<JobApplication, '_id' | 'userId'>) => await createJobApplication(jobData)}
            onGoBackRoute="/"
            headerText="Add New Job Application"
            bodyText="Fill out the details for your new job application."
            buttonText="Add Application"
        />
    );
};

export default AddApplicationPage;