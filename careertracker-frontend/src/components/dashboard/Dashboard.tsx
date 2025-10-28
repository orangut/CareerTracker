import React from 'react';
import {Box, Button, Container, Grid, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DashboardFilter from './DashboardFilter';
import JobApplicationCard from './JobApplicationCard';
import {type JobApplication} from "../../models/JobApplication";
import Metrics from "./Metrics.tsx";
import {useJobApplications} from '../../context/JobApplicationContext';
import {useNavigate} from "react-router-dom";


const Dashboard = () => {
    const {jobApplications} = useJobApplications();
    const navigate = useNavigate();

    const [filteredJobs, setFilteredJobs] = React.useState<JobApplication[]>(jobApplications);

    return (
        <Box sx={{pb: 4, minHeight: '100vh', bgcolor: 'background.default'}}>
            <Container maxWidth={false} sx={{py: 4}}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant="h4" fontWeight="bold">
                        Job Applications
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => navigate('/add')}
                    >
                        Add Application
                    </Button>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
                    Track and manage your job search progress
                </Typography>

                {Metrics(jobApplications)}

                <DashboardFilter
                    jobData={jobApplications}
                    onFilteredJobsChange={setFilteredJobs}
                />

                <Grid container spacing={2}>
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <Grid key={job._id}>
                                <JobApplicationCard job={job}/>
                            </Grid>
                        ))
                    ) : (
                        <Box
                            sx={{
                                p: 4,
                                width: '100%',
                                textAlign: 'center',
                                color: 'text.secondary',
                                mt: 4,
                            }}
                        >
                            <Typography variant="h6">No jobs match your filters.</Typography>
                        </Box>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;