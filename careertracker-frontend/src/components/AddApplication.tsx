import React, {useRef} from 'react';
import {Box, Button, Container, Typography, useMediaQuery, useTheme} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type JobApplication from '../models/JobApplication.ts';
import ApplicationForm, {type ApplicationFormHandle} from './ApplicationForm.tsx';

interface AddApplicationPageProps {
    onGoBack: () => void;
    onSubmit: (newJob: Omit<JobApplication, 'id' | 'isEdit'>) => void;
}

const AddApplicationPage: React.FC<AddApplicationPageProps> = ({onGoBack, onSubmit}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const formRef = useRef<ApplicationFormHandle>(null);

    const handleSubmit = () => {
        formRef.current?.validateAndSubmit();
        onGoBack();
    };

    return (
        <Container sx={{py: 4}}>
            <Box
                sx={{
                    maxWidth: {xs: '100%', md: 700},
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                }}
            >
                <Button variant="text" startIcon={<ArrowBackIcon/>} onClick={onGoBack}>
                    Back to Dashboard
                </Button>
            </Box>
            <Box
                sx={{
                    maxWidth: {xs: '100%', md: 600},
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
            >
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    Add New Application
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{mb: 4, marginBottom: 0}}>
                    Fill out the form below to add a new job application to your tracker.
                </Typography>
            </Box>
            <ApplicationForm ref={formRef} onSubmit={onSubmit} />
            <Box
                sx={{
                    maxWidth: {xs: '100%', md: 600},
                    mx: 'auto',
                    p: isMobile ? 2 : 4,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    borderBottomRightRadius: 8,
                    borderBottomLeftRadius: 8
                }}
            >
                <Button variant="contained" onClick={handleSubmit} fullWidth>
                    Add Application
                </Button>
            </Box>
        </Container>
    );
};

export default AddApplicationPage;
