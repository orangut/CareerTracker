import {useEffect, useState} from 'react';
import {Box, Container, Grid, Typography} from '@mui/material';
import JobApplicationCard from './components/JobApplicationCard';
import DashboardFilter from './components/DashboardFilter';
import {
    allInterestLevels,
    type AllInterestLevelsType,
    allRemoteOptions,
    type AllRemoteOptionsType,
    allStages,
    type AllStagesType,
    jobData,
} from './Constants';

function App() {
    const [filters, setFilters] = useState({
        freeText: '',
        currentStage: '',
        interestLevel: '',
        jobType: '',
    });

    const [filteredJobs, setFilteredJobs] = useState(jobData);

    useEffect(() => {
        const newFilteredJobs = jobData.filter((job) => {
            // Filter by free text
            if (
                filters.freeText &&
                !(
                    job.company
                        .toLowerCase()
                        .includes(filters.freeText.toLowerCase()) ||
                    job.position
                        .toLowerCase()
                        .includes(filters.freeText.toLowerCase())
                )
            ) {
                return false;
            }

            // Filter by current stage
            if (filters.currentStage && filters.currentStage !== '' && job.current_stage !== filters.currentStage) {
                return false;
            }

            // Filter by interest level
            if (
                filters.interestLevel &&
                filters.interestLevel !== '' &&
                job.interest_level !== Number(filters.interestLevel)
            ) {
                return false;
            }

            // Filter by job type
            return !(filters.jobType && filters.jobType !== '' && job.remote_option !== filters.jobType);


        });

        setFilteredJobs(newFilteredJobs);
    }, [filters]);

    const handleFilterChange = (newFilters: {
        freeText?: string;
        currentStage?: AllStagesType | '';
        interestLevel?: AllInterestLevelsType | '';
        jobType?: AllRemoteOptionsType | '';
    }) => {
        setFilters((prevFilters) => {
            const updatedFilters = {...prevFilters};
            if (newFilters.freeText !== undefined) {
                updatedFilters.freeText = newFilters.freeText;
            }
            if (newFilters.currentStage !== undefined) {
                updatedFilters.currentStage = newFilters.currentStage;
            }
            if (newFilters.interestLevel !== undefined) {
                updatedFilters.interestLevel = newFilters.interestLevel as string;
            }
            if (newFilters.jobType !== undefined) {
                updatedFilters.jobType = newFilters.jobType;
            }
            return updatedFilters;
        });
    };

    return (
        <Container sx={{py: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
                My Job Applications
            </Typography>
            <DashboardFilter
                onFilterChange={handleFilterChange}
                currentStages={allStages}
                interestLevels={allInterestLevels}
                jobTypes={allRemoteOptions}
            />
            <Box sx={{maxWidth: 'lg', mx: 'auto', width: '100%', flexGrow: 1}}>
                <Grid container spacing={2} justifyContent="left" sx={{mt: 2, flexGrow: 1}}>
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <Grid key={job.id}>
                                <JobApplicationCard job={job}/>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="h6" color="text.secondary" sx={{mt: 4}}>
                            No jobs match the current filters.
                        </Typography>
                    )}
                </Grid>
            </Box>
        </Container>
    );
}

export default App;
