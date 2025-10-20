import { Box, Card, CardContent, Chip, IconButton, Stack, Typography, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import { type JobApplication } from "../../models/JobApplication.ts";
import { useNavigate } from "react-router-dom";
import { getStatusChipStyles, getRemoteOptionChipStyles, formatDate, getSalaryString } from '../../utils/helperFunctions.ts';
import StarRaiting from '../starRaiting.tsx';

interface JobApplicationCardProps {
    job: JobApplication;
}

const JobApplicationCard = ({ job }: JobApplicationCardProps) => {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                width: 360,
                height: 240,
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
                        <EditIcon fontSize="small" onClick={() => navigate(`/edit/${job._id}`)} />
                    </IconButton>
                </Box>
            )}

            <CardContent sx={{ p: 2, pb: 0, flexGrow: 1 }}>
                {/* Title, company, and edit icon */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {job.position}
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" color="text.secondary">
                            {job.company}
                        </Typography>
                        <StarRaiting value={job.interestLevel} />
                    </Stack>
                </Box>

                {/* Location and Applied Date */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} >
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {job.location}
                            </Typography>
                        </Stack>
                        <Chip
                            label={job.remoteOption}
                            size="small"
                            sx={{ ml: 2, ...getRemoteOptionChipStyles(job.remoteOption) }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CalendarTodayIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                Applied {formatDate(job.applicationDate)}
                            </Typography>
                        </Stack>
                        {job.lastStageType && <Chip
                            label={job.lastStageType.replace('_', ' ')}
                            size="small"
                            sx={getStatusChipStyles(job.lastStageType)}
                        />}
                    </Stack>
                </Box>

                {/* Salary Range and View Details */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 14 }}>
                        {getSalaryString(job?.salaryMin, job?.salaryMax)}
                    </Typography>
                    <Button variant='text' sx={{ textTransform: "none" }} onClick={() => navigate(`/view/${job._id}`)}>
                        View Details
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default JobApplicationCard;