import React, {useEffect} from 'react';
import type {SelectChangeEvent} from '@mui/material';
import {Box, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import JobApplication, {allInterestLevels, allRemoteOptions, allStages} from '../../models/JobApplication';

interface DashboardFilterProps {
    onFilteredJobsChange: (filteredJobs: JobApplication[]) => void;
    jobData: JobApplication[];
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({onFilteredJobsChange, jobData}) => {
    const [filters, setFilters] = React.useState({
        freeText: '',
        currentStage: '',
        interestLevel: 0,
        remoteOption: '',
    });

    useEffect(() => {
        const filteredJobs = jobData.filter((job) => {
            const matchesFreeText =
                filters.freeText === '' ||
                job.position.toLowerCase().includes(filters.freeText.toLowerCase()) ||
                job.company.toLowerCase().includes(filters.freeText.toLowerCase());
            const matchesCurrentStage =
                filters.currentStage === '' || job.currentStage === filters.currentStage;
            const matchesInterestLevel = Number(job.interestLevel) >= Number(filters.interestLevel);
            const matchesRemoteOption =
                filters.remoteOption === '' || job.remoteOption === filters.remoteOption;

            return matchesFreeText && matchesCurrentStage && matchesInterestLevel && matchesRemoteOption;
        });

        onFilteredJobsChange(filteredJobs);
    }, [filters, jobData, onFilteredJobsChange]);

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFreeText = event.target.value;
        setFilters((prev) => ({...prev, freeText: newFreeText}));
    };

    const handleCurrentStageChange = (event: SelectChangeEvent) => {
        const newCurrentStage = event.target.value;
        setFilters((prev) => ({...prev, currentStage: newCurrentStage}));
    };

    const handleInterestLevelChange = (event: SelectChangeEvent<string | number>) => {
        const newInterestLevel = event.target.value;
        setFilters((prev) => ({...prev, interestLevel: newInterestLevel as number | 0}));
    };

    const handleRemoteOptionChange = (event: SelectChangeEvent) => {
        const newRemoteOption = event.target.value;
        setFilters((prev) => ({...prev, remoteOption: newRemoteOption}));
    };

    return (
        <Box
            sx={{
                width: '100%',
                p: 2,
                pb: 4,
                minHeight: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Stack
                direction={{xs: 'column', md: 'row'}}
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{width: '100%'}}
            >
                <TextField
                    label="Search applications..."
                    variant="outlined"
                    value={filters.freeText}
                    onChange={handleTextChange}
                    sx={{flex: {md: 2}}}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />

                <FormControl sx={{minWidth: 160}}>
                    <InputLabel>All Stages</InputLabel>
                    <Select
                        value={filters.currentStage}
                        label="All Stages"
                        onChange={handleCurrentStageChange}
                    >
                        <MenuItem value="">
                            <em>All Stages</em>
                        </MenuItem>
                        {allStages.map((stage) => (
                            <MenuItem key={stage} value={stage}>
                                {stage.replace('_', ' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{minWidth: 160}}>
                    <InputLabel>All Interest</InputLabel>
                    <Select
                        value={filters.interestLevel}
                        label="All Interest"
                        onChange={handleInterestLevelChange}
                    >
                        <MenuItem value="">
                            <em>All Interest</em>
                        </MenuItem>
                        {allInterestLevels.map((level) => (
                            <MenuItem key={level} value={level}>
                                {level === 0 ? 'Not Interested' : `Level ${level}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{minWidth: 160}}>
                    <InputLabel>All Types</InputLabel>
                    <Select
                        value={filters.remoteOption}
                        label="All Types"
                        onChange={handleRemoteOptionChange}
                    >
                        <MenuItem value="">
                            <em>All Types</em>
                        </MenuItem>
                        {allRemoteOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
        </Box>
    );
};

export default DashboardFilter;