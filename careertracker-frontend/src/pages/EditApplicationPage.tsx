// EditApplicationPage.tsx
import {useNavigate, useParams} from 'react-router-dom';
import {useJobApplications} from '../context/JobApplicationContext';
import {type JobApplication} from '../models/JobApplication';
import JobApplicationForm from '../components/JobApplicationForm';

const EditApplicationPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {updateJobApplication, readJobApplication} = useJobApplications();

    const jobToEdit = id ? readJobApplication(id) : undefined

    const handleUpdate = (jobData: Omit<JobApplication, 'id' | 'isEdit'>) => {

        if (!jobToEdit) {
            console.error('Job application not found for update.');
            return;
        }

        const updatedJob: JobApplication = {
            ...jobData,
            id: jobToEdit.id,
            isEdit: true,
        };

        updateJobApplication(updatedJob);
        navigate('/')
        // navigate(`/view/${id}`);
    };

    // If no job is found, redirect
    if (!jobToEdit) {
        navigate('/');
        return null;
    }

    return (
        <JobApplicationForm
            applicationJobId={jobToEdit.id}
            onSubmit={handleUpdate}
            onGoBackRoute={'/'}
            headerText="Edit Job Application"
            bodyText="Update the details for this job application."
            buttonText="Save Changes"
        />
    );
};

export default EditApplicationPage;