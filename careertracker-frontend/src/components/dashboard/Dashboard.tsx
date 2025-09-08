import React from 'react';
import {Box, Button, Container, Grid, ThemeProvider, Typography, useMediaQuery, useTheme} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DashboardFilter from './DashboardFilter';
import JobApplicationCard from './JobApplicationCard';
import Metrics from "./Metrics";
import JobApplication from "../../models/JobApplication";
import {darkTheme} from "../../Theme.tsx";

const Dashboard = ({ jobData }: { jobData: JobApplication[] }) => {
    const [filteredJobs, setFilteredJobs] = React.useState<JobApplication[]>(jobData);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
                <Container sx={{ py: 4 }}>
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
                            startIcon={<AddIcon />}
                        >
                            Add Application
                        </Button>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Track and manage your job search progress
                    </Typography>

                    {Metrics(jobData)}

                    <DashboardFilter
                        jobData={jobData}
                        onFilteredJobsChange={setFilteredJobs}
                    />

                    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
                        <Grid container spacing={2} sx={{ minHeight: isMobile ? 'auto' : '500px' }}>
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <Grid key={job.id}>
                                        <JobApplicationCard job={job} />
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
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard;