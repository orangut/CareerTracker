import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from 'react-router-dom';

import { useJobApplications } from '../context/JobApplicationContext';
import { type AllInterestLevelsType, allRemoteOptions, type JobApplication } from '../models/JobApplication';
import StarRaiting from './starRaiting';

// Define the default empty job application state for new entries
const DEFAULT_JOB_APPLICATION_STATE: Omit<JobApplication, '_id' | 'userId'> = {
    company: '',
    position: '',
    location: '',
    applicationDate: new Date().toISOString().split('T')[0],
    interestLevel: 0,
    lastStageType: 'applied',
    salaryMin: undefined,
    salaryMax: undefined,
    remoteOption: 'hybrid',
    notes: undefined,
    jobUrl: '',
    isEdit: true,
};

interface ApplicationFormProps {
    applicationJobId?: string | null;
    onSubmit: (jobData: Omit<JobApplication, '_id' | 'userId'>) => Promise<void>;
    onGoBackRoute: string;
    headerText: string;
    bodyText: string;
    buttonText: string;
}

const JobApplicationForm: React.FC<ApplicationFormProps> = ({
    applicationJobId = null,
    onSubmit,
    onGoBackRoute,
    headerText,
    bodyText,
    buttonText
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { readJobApplication } = useJobApplications();
    const navigate = useNavigate();

    const [formState, setFormState] = useState<Omit<JobApplication, '_id' | 'userId'>>(DEFAULT_JOB_APPLICATION_STATE);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (applicationJobId) {
            const jobToEdit = readJobApplication(applicationJobId);
            if (jobToEdit) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id: id, ...restOfJob } = jobToEdit;
                setFormState(restOfJob);
            }
        } else {
            setFormState(DEFAULT_JOB_APPLICATION_STATE);
        }
    }, [applicationJobId, readJobApplication]);

    const validateAndSubmit = async () => {
        try {
            if (formState.company && formState.position) {
                await onSubmit(formState);
                navigate(onGoBackRoute);
            } else {
                // Optional: Add some visual feedback for validation failure
                setErrorMsg("Please fill out all required fields.");
            }
        } catch (error) {
            setErrorMsg("An error occurred while submitting the form.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;
        if (type === 'date') {
            newValue = new Date(value).toISOString();
        }
        else if (name === 'notes') {
            newValue = [value];
        }
        setFormState(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSelectionChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null) => {
        setFormState(prev => ({ ...prev, interestLevel: newValue ? newValue as AllInterestLevelsType : 0 }));
    };

    const handleClearRating = () => {
        setFormState(prev => ({ ...prev, interestLevel: 0 }));
    };

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, valueAsNumber } = e.target;
        const value = isNaN(valueAsNumber) ? null : valueAsNumber;

        setFormState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSalaryBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setFormState(prev => {
            const newState = { ...prev };
            if (newState.salaryMin && newState.salaryMax) {
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
        <Container sx={{ py: 4, paddingTop: 0, paddingBottom: 0 }}>
            <Box
                sx={{
                    maxWidth: { xs: '100%', md: 700 },
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                }}
            >
                <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(onGoBackRoute)}>
                    Back
                </Button>
            </Box>
            <Box
                sx={{
                    maxWidth: { xs: '100%', md: 600 },
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
            >
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    {headerText}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, marginBottom: 0 }}>
                    {bodyText}
                </Typography>
            </Box>
            <Box
                sx={{
                    maxWidth: { xs: '100%', md: 600 },
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    borderBottomRightRadius: 8,
                    borderBottomLeftRadius: 8,
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
                            value={new Date(formState.applicationDate).toISOString().split('T')[0]}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </Stack>
                    <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                        <FormControl fullWidth required>
                            <InputLabel>Remote Option</InputLabel>
                            <Select
                                name="remoteOption"
                                value={formState.remoteOption}
                                label="Remote Option"
                                onChange={handleSelectionChange}
                            >
                                {allRemoteOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            name="jobUrl"
                            label="Job URL"
                            value={formState.jobUrl}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
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
                                inputProps={{ step: 0.5 }}
                            />
                            <TextField
                                name="salaryMax"
                                label="Max Salary (in k)"
                                type="number"
                                value={formState.salaryMax ?? ''}
                                onChange={handleSalaryChange}
                                onBlur={handleSalaryBlur}
                                inputProps={{ step: 0.5 }}
                            />
                        </Stack>
                        <Stack direction="row" flexGrow={1}>
                            <Stack alignItems="center">
                                <Typography variant="body1" color="text.secondary">Interest Level</Typography>
                                <StarRaiting
                                    value={formState.interestLevel}
                                    onChange={handleRatingChange}
                                />
                            </Stack>
                            {formState.interestLevel > 0 && (
                                <IconButton onClick={handleClearRating} size="small" sx={{ ml: 1 }}>
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>

                    <Stack>
                        <Box sx={{ display: 'block', width: '100%' }}>
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
                    <Button variant="contained" onClick={validateAndSubmit} fullWidth>
                        {buttonText}
                    </Button>
                    {errorMsg && <Typography color="error" variant="body2">{errorMsg}</Typography>}
                </Stack>
            </Box>
        </Container>
    );
};

export default JobApplicationForm;