import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Chip, Link, Divider, Rating, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useJobApplications } from '../context/JobApplicationContext';
import { getStatusChipStyles, getRemoteOptionChipStyles, formatDate, getSalaryString } from '../utils/helperFunctions.ts';

const ViewApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { readJobApplication } = useJobApplications();
  const job = id ? readJobApplication(id) : undefined;

  const navigate = useNavigate();

  if (!job) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Job application not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0, p: 4 }}>
      {/* Left: Job Details */}
      <Box sx={{ flex: 1, pr: 4 }}>
        <Stack spacing={2} >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>
              {job.position}
            </Typography>
            {job.isEdit && (
              <IconButton size="small">
                <EditIcon fontSize="small" onClick={() => navigate(`/edit/${job.id}`)} />
              </IconButton>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              {job.company}
            </Typography>
            <Rating
              name="job-rating"
              value={job.interestLevel}
              readOnly
              precision={0.5}
            />
          </Stack>
          <Divider />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
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
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Applied {formatDate(job.applicationDate)}
              </Typography>
            </Stack>
            <Chip
              label={job.currentStage.replace('_', ' ')}
              size="small"
              sx={getStatusChipStyles(job.currentStage)}
            />
          </Stack>
          <Box sx={{ height: 16 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} >
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 14 }}>
              {getSalaryString(job?.salaryMin, job?.salaryMax)}
            </Typography>
            <Link
              href={job.jobUrl}
              target="_blank"
              rel="noopener"
              variant="body2"
              sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
            >
              {job.jobUrl} <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </Link>
          </Stack>
          <Divider />
          {job.notes && job.notes.length > 0 && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {[job.notes].map((note, idx) => (
                <Typography key={idx} variant="body2">
                  • {note}
                </Typography>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Vertical Divider */}
      <Divider orientation="vertical" flexItem />

      {/* Right: Stages Display */}
      <Box
        sx={{
          flex: 2,
          pl: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Stages display goes here
        </Typography>
      </Box>
    </Box >
  );
};

export default ViewApplicationPage;