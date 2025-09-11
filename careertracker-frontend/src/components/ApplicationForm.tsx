import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {
    Box,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Rating,
    Select,
    type SelectChangeEvent,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import JobApplication, {type AllInterestLevelsType, allRemoteOptions, allStages} from '../models/JobApplication';

interface ApplicationFormProps {
    initialJob?: JobApplication;
    onSubmit: (jobData: Omit<JobApplication, 'id' | 'isEdit'>) => void;
}


export interface ApplicationFormHandle {
    validateAndSubmit: () => void;
}

const ApplicationForm = forwardRef<ApplicationFormHandle, ApplicationFormProps>(({
                                                                                     initialJob,
                                                                                     onSubmit,
                                                                                 }, ref) => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    const [formState, setFormState] = useState<Omit<JobApplication, 'id' | 'isEdit'>>({
        company: initialJob?.company || '',
        position: initialJob?.position || '',
        location: initialJob?.location || '',
        applicationDate: initialJob?.applicationDate || new Date().toISOString().split('T')[0],
        interestLevel: initialJob?.interestLevel || 0,
        currentStage: initialJob?.currentStage || 'applied',
        salaryMin: initialJob?.salaryMin ?? null,
        salaryMax: initialJob?.salaryMax ?? null,
        remoteOption: initialJob?.remoteOption || "hybrid",
        jobUrl: initialJob?.jobUrl || '',
        notes: initialJob?.notes || '',
    });

    useImperativeHandle(ref, () => ({
        validateAndSubmit() {
            if (formState.company && formState.position && formState.currentStage) {
                onSubmit(formState);
            }
        }
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const {name, value} = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null) => {
        setFormState(prev => ({...prev, interestLevel: newValue ? newValue as AllInterestLevelsType : 0}));
    };

    const handleClearRating = () => {
        setFormState(prev => ({...prev, interestLevel: 0}));
    };

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, valueAsNumber} = e.target;
        const value = isNaN(valueAsNumber) ? null : valueAsNumber;

        setFormState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSalaryBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const {name} = e.target;
        setFormState(prev => {
            const newState = {...prev};
            if (newState.salaryMin !== null && newState.salaryMax !== null) {
                if (name === 'salaryMin' && newState.salaryMin > newState.salaryMax) {
                    newState.salaryMax = newState.salaryMin;
                } else if (name === 'salaryMax' && newState.salaryMax < newState.salaryMin) {
                    newState.salaryMin = newState.salaryMax;
                }
            }
            return newState;
        });
    };


    return (
        <Container sx={{py: 4, paddingTop: 0, paddingBottom: 0}}>
            <Box
                sx={{
                    maxWidth: {xs: '100%', md: 600},
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                }}
            >
                <Stack spacing={3} component="form">
                    <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                        <TextField
                            name="company"
                            label="Company"
                            value={formState.company}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            name="position"
                            label="Position"
                            value={formState.position}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Stack>
                    <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                        <TextField
                            name="location"
                            label="Location"
                            value={formState.location}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            name="applicationDate"
                            label="Application Date"
                            type="date"
                            value={formState.applicationDate}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </Stack>


                    <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                        <FormControl fullWidth required>
                            <InputLabel>Current Stage</InputLabel>
                            <Select
                                name="currentStage"
                                value={formState.currentStage}
                                label="Current Stage"
                                onChange={handleChange}
                            >
                                {allStages.map((stage) => (
                                    <MenuItem key={stage} value={stage}>
                                        {stage.replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Remote Option</InputLabel>
                            <Select
                                name="remoteOption"
                                value={formState.remoteOption}
                                label="Remote Option"
                                onChange={handleChange}
                            >
                                {allRemoteOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack direction={isMobile ? "column" : "row"} spacing={3} justifyContent="space-between"
                           alignItems="center">
                        <Stack direction="row" spacing={2} maxWidth={'70%'}>
                            <TextField
                                name="salaryMin"
                                label="Min Salary (in k)"
                                type="number"
                                value={formState.salaryMin ?? ''}
                                onChange={handleSalaryChange}
                                onBlur={handleSalaryBlur}
                                inputProps={{step: 0.5}}
                            />
                            <TextField
                                name="salaryMax"
                                label="Max Salary (in k)"
                                type="number"
                                value={formState.salaryMax ?? ''}
                                onChange={handleSalaryChange}
                                onBlur={handleSalaryBlur}
                                inputProps={{step: 0.5}}
                            />
                        </Stack>
                        <Stack direction="row" flexGrow={1}>
                            <Stack alignItems="center">
                                <Typography variant="body1" color="text.secondary">Interest Level</Typography>
                                <Rating
                                    name="interestLevel"
                                    value={formState.interestLevel}
                                    onChange={handleRatingChange}
                                    precision={0.5}
                                />
                            </Stack>

                            {formState.interestLevel > 0 && (
                                <IconButton onClick={handleClearRating} size="small" sx={{ml: 1}}>
                                    <CloseIcon fontSize="inherit"/>
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>
                    <TextField
                        name="jobUrl"
                        label="Job URL"
                        value={formState.jobUrl}
                        onChange={handleChange}
                        fullWidth
                    />

                    <Stack>
                        {/*<Typography variant="body1">Notes</Typography>*/}
                        <Box sx={{display: 'block', width: '100%'}}>
                            <TextField
                                name="notes"
                                label="Notes"
                                area-label="Notes"
                                value={formState.notes}
                                onChange={handleChange}
                                multiline
                                minRows={5}
                                maxRows={5}
                                variant="outlined"
                                style={{
                                    width: '100%',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </Box>
                    </Stack>

                </Stack>

            </Box>
        </Container>
    );
})

export default ApplicationForm;
