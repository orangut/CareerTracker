// EditApplicationPage.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useJobApplications } from '../context/JobApplicationContext';
import { type JobApplication } from '../models/JobApplication';
import JobApplicationForm from '../components/JobApplicationForm';
import { Box, Typography, Button } from '@mui/material';

const EditApplicationPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { updateJobApplication, readJobApplication } = useJobApplications();

    const jobToEdit = id ? readJobApplication(id) : undefined;

    // If no job is found, show a back arrow and 'not found' message
    if (!jobToEdit) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} textAlign="center" >
                <Typography variant="h5" gutterBottom>
                    Job Application Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    The requested job application could not be found.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/')} >
                    Back to Home
                </Button>
            </Box>
        );
    }

    return (
        <JobApplicationForm
            applicationJobId={id}
            onSubmit={async (jobData: Omit<JobApplication, '_id' | 'userId'>) => await updateJobApplication({ ...jobData, _id: jobToEdit._id, userId: jobToEdit.userId })}
            onGoBackRoute={'/'}
            headerText="Edit Job Application"
            bodyText="Update the details for this job application."
            buttonText="Save Changes"
        />
    );
};

export default EditApplicationPage;