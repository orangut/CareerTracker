import React from 'react';
import type {SelectChangeEvent} from '@mui/material';
import {Box, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField,} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type {AllInterestLevelsType, AllRemoteOptionsType, AllStagesType,} from '../Constants';

interface DashboardFilterProps {
    onFilterChange: (filters: {
        freeText?: string;
        currentStage?: AllStagesType | '';
        interestLevel?: AllInterestLevelsType | '';
        jobType?: AllRemoteOptionsType | '';
    }) => void;
    currentStages: readonly AllStagesType[];
    interestLevels: readonly AllInterestLevelsType[];
    jobTypes: readonly AllRemoteOptionsType[];
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({
                                                             onFilterChange,
                                                             currentStages,
                                                             interestLevels,
                                                             jobTypes,
                                                         }) => {
    const [filters, setFilters] = React.useState({
        freeText: '',
        currentStage: '',
        interestLevel: '',
        jobType: '',
    });

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFreeText = event.target.value;
        setFilters((prev) => ({...prev, freeText: newFreeText}));
        onFilterChange({freeText: newFreeText});
    };

    const handleCurrentStageChange = (event: SelectChangeEvent) => {
        const newCurrentStage = event.target.value;
        setFilters((prev) => ({...prev, currentStage: newCurrentStage}));
        onFilterChange({currentStage: newCurrentStage as AllStagesType | ''});
    };

    const handleInterestLevelChange = (event: SelectChangeEvent<string | number>) => {
        const newInterestLevel = event.target.value;
        setFilters((prev) => ({...prev, interestLevel: String(newInterestLevel)}));
        onFilterChange({interestLevel: newInterestLevel as AllInterestLevelsType | ''});
    };

    const handleJobTypeChange = (event: SelectChangeEvent) => {
        const newJobType = event.target.value;
        setFilters((prev) => ({...prev, jobType: newJobType}));
        onFilterChange({jobType: newJobType as AllRemoteOptionsType | ''});
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
                        {currentStages.map((stage) => (
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
                        {interestLevels.map((level) => (
                            <MenuItem key={level} value={level}>
                                {level === 0 ? 'Not Interested' : `Level ${level}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{minWidth: 160}}>
                    <InputLabel>All Types</InputLabel>
                    <Select
                        value={filters.jobType}
                        label="All Types"
                        onChange={handleJobTypeChange}
                    >
                        <MenuItem value="">
                            <em>All Types</em>
                        </MenuItem>
                        {jobTypes.map((type) => (
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
