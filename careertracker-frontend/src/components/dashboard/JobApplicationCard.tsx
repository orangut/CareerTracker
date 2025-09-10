import {Box, Card, CardContent, Chip, IconButton, Link, Rating, Stack, Typography,} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import type JobApplication from "../../models/JobApplication.ts";

interface JobApplicationCardProps {
    job: JobApplication;
}

// Helper function for status chip styles
const getStatusChipStyles = (status: JobApplication['currentStage']) => {
    switch (status) {
        case 'applied':
            return {bgcolor: 'rgba(0, 150, 255, 0.1)', color: 'info.dark'}; // Blue
        case 'phone_screen':
            return {bgcolor: 'rgba(150, 0, 150, 0.1)', color: 'secondary.dark'}; // Purple
        case 'technical_interview':
            return {bgcolor: 'rgba(255, 165, 0, 0.1)', color: 'warning.dark'}; // Orange
        case 'final_interview':
        case 'offer':
            return {bgcolor: 'rgba(0, 128, 0, 0.1)', color: 'success.dark'}; // Green
        case 'rejected':
        case 'withdrawn':
            return {bgcolor: 'rgba(255, 0, 0, 0.1)', color: 'error.dark'}; // Red
        default:
            return {bgcolor: 'grey.200', color: 'grey.800'};
    }
};

// Helper function for job type chip styles
const getRemoteOptionChipStyles = (remoteOption: JobApplication['remoteOption']) => {
    switch (remoteOption) {
        case 'remote':
            return {bgcolor: 'rgba(0, 128, 0, 0.1)', color: 'success.dark'};
        case 'hybrid':
            return {bgcolor: 'rgba(0, 0, 255, 0.1)', color: 'primary.dark'};
        case 'onsite':
            return {bgcolor: 'rgba(128, 0, 128, 0.1)', color: 'secondary.dark'};
        default:
            return {bgcolor: 'grey.200', color: 'grey.800'};
    }
};

const JobApplicationCard = ({job}: JobApplicationCardProps) => {
    const dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as Intl.DateTimeFormatOptions;
    const formattedDate = new Date(job.applicationDate).toLocaleDateString(
        'en-US',
        dateOptions
    );

    return (
        <Card
            sx={{
                width: 320,
                height: 320,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: 2,
                borderRadius: 2,
                boxShadow: 3,
                p: 1,
                fontFamily: 'Roboto, sans-serif',
                position: 'relative',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: 6,
                },
            }}
        >
            {/* Absolute positioned edit icon container */}
            {job.isEdit && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        opacity: 0, // Hidden by default
                        transition: 'opacity 0.3s', // Smooth fade in/out
                        // Show on hover
                        '.MuiCard-root:hover &': {
                            opacity: 1,
                        },
                    }}
                >
                    <IconButton size="small">
                        <EditIcon fontSize="small"/>
                    </IconButton>
                </Box>
            )}

            <CardContent sx={{p: 2, pb: 0, flexGrow: 1}}>
                {/* Title, company, and edit icon */}
                <Box sx={{mb: 2}}>
                    <Typography variant="h6" component="div" sx={{fontWeight: 'bold'}}>
                        {job.position}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {job.company}
                    </Typography>
                </Box>

                {/* Location and Applied Date */}
                <Box sx={{mb: 3}}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{mb: 2}}>
                        <LocationOnIcon fontSize="small" color="action"/>
                        <Typography variant="body2" color="text.secondary">
                            {job.location}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <CalendarTodayIcon fontSize="small" color="action"/>
                        <Typography variant="body2" color="text.secondary">
                            Applied {formattedDate}
                        </Typography>
                    </Stack>
                </Box>

                {/* Rating */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center" // Aligns items vertically in the center
                    sx={{mb: 2}} // Adds margin below the stack for spacing
                >
                    <Rating
                        name="job-rating"
                        value={job.interestLevel}
                        readOnly
                        precision={0.5}
                    />
                    <Chip
                        label={job.remoteOption}
                        size="small"
                        sx={getRemoteOptionChipStyles(job.remoteOption)}
                    />
                </Stack>

                {/* Status and View Details Link */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                        label={job.currentStage.replace('_', ' ')}
                        size="small"
                        sx={getStatusChipStyles(job.currentStage)}
                    />
                    <Link
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener"
                        variant="body2"
                        sx={{display: 'flex', alignItems: 'center', fontWeight: 'bold'}}
                    >
                        View Details <OpenInNewIcon sx={{fontSize: 16, ml: 0.5}}/>
                    </Link>
                </Stack>
            </CardContent>

            {/* Salary Range (Pushed to the bottom) */}
            <Box
                sx={{p: 3, pt: 0, display: 'flex', justifyContent: 'flex-start', pl: 2}}
            >
                <Typography variant="h6" sx={{fontWeight: 'bold', fontSize: 14}}>
                    {job?.salaryMin ? `${job.salaryMin.toString()}k$` : '?'} - {job?.salaryMax ? `${job.salaryMax}k$` : '?'}
                </Typography>
            </Box>
        </Card>
    );
};

export default JobApplicationCard;
