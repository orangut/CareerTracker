import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Chip, Link, Divider, Rating, IconButton, Paper } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useJobApplications } from '../context/JobApplicationContext';
import { getStatusChipStyles, getRemoteOptionChipStyles, formatDate, getSalaryString } from '../utils/helperFunctions.ts';
import StageCard from '../components/StageCard.tsx';
import { useState } from 'react';
import type { Stage } from '../models/stage.ts';

const ViewApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { readJobApplication } = useJobApplications();
  const job = id ? readJobApplication(id) : undefined;
  const navigate = useNavigate();

  // For demo: use job.stages or fallback to a default list
  const stages: Stage[] = [
    {
      jobApplicationId: 'job123',
      type: 'applied',
      startedAt: '2025-09-01T09:00:00Z',
      completedAt: '2025-09-01T09:05:00Z',
      notes: ['Resume submitted via company website'],
      createdAt: '2025-09-01T09:00:00Z',
      updatedAt: '2025-09-01T09:05:00Z',
    },
    {
      jobApplicationId: 'job123',
      type: 'phone_screen',
      startedAt: '2025-09-03T10:00:00Z',
      completedAt: '2025-09-03T10:30:00Z',
      notes: ['Spoke with recruiter about role'],
      createdAt: '2025-09-03T10:00:00Z',
      updatedAt: '2025-09-03T10:30:00Z',
    },
    {
      jobApplicationId: 'job123',
      type: 'technical_interview',
      startedAt: '2025-09-05T14:00:00Z',
      notes: ['Technical interview scheduled with team'],
      createdAt: '2025-09-05T14:00:00Z',
      updatedAt: '2025-09-05T14:00:00Z',
    },
    {
      jobApplicationId: 'job123',
      type: 'applied',
      startedAt: '2025-09-01T09:00:00Z',
      completedAt: '2025-09-01T09:05:00Z',
      notes: ['Resume submitted via company website'],
      createdAt: '2025-09-01T09:00:00Z',
      updatedAt: '2025-09-01T09:05:00Z',
    },
    {
      jobApplicationId: 'job123',
      type: 'phone_screen',
      startedAt: '2025-09-03T10:00:00Z',
      completedAt: '2025-09-03T10:30:00Z',
      notes: ['Spoke with recruiter about role'],
      createdAt: '2025-09-03T10:00:00Z',
      updatedAt: '2025-09-03T10:30:00Z',
    },
    {
      jobApplicationId: 'job123',
      type: 'technical_interview',
      startedAt: '2025-09-05T14:00:00Z',
      notes: ['Technical interview scheduled with team'],
      createdAt: '2025-09-05T14:00:00Z',
      updatedAt: '2025-09-05T14:00:00Z',
    },
  ];

  const [selectedStageIdx, setSelectedStageIdx] = useState(0);


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
      <Stack spacing={2} sx={{ flex: 1, pr: 4 }}>
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

      {/* Right: Sunken Stages Display */}
      <Box
        sx={{
          flex: 2,
          pl: 4,
          height: "80vh",
          m: "auto",
          bgcolor: "background.default",
          borderRadius: 2,
          // Create inset shadows to make it look "pushed in"
          boxShadow: `
          inset 2px 2px 8px rgba(0,0,0,0.25),
          inset -2px -2px 8px rgba(255,255,255,0.8)
        `,
        }}
      >
        {/* Stages List */}
        <Box sx={{
          width: "100%",
          display: 'flex',

        }}>
          {/* Scrollable StageCards list */}
          <Stack
            spacing={2}
            sx={{
              // maxHeight: 400,
              flex: 1,
              overflowY: 'auto',
              p: 2,
            }}
          >
            <Typography variant='h6' color='primary'>
              Timeline
            </Typography>
            {stages.map((stage, idx) => (
              <StageCard id={idx} isSelected={idx === selectedStageIdx} onSelect={(id) => setSelectedStageIdx(id)} title={stage.type} time={stage.createdAt} />
            ))}
          </Stack>

          {/* Stage Details */}
          <Box sx={{ flex: 1, pl: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={2} sx={{ p: 3, minWidth: 240 }}>
              <Typography variant="h6" gutterBottom>
                Stage Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Type:</Typography>
                  <Typography variant="body2">{stages[selectedStageIdx].type}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Started At:</Typography>
                  <Typography variant="body2">{stages[selectedStageIdx].startedAt?.toString()}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Completed At:</Typography>
                  <Typography variant="body2">{stages[selectedStageIdx].completedAt?.toString() || '—'}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Created At:</Typography>
                  <Typography variant="body2">{stages[selectedStageIdx].createdAt?.toString()}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Updated At:</Typography>
                  <Typography variant="body2">{stages[selectedStageIdx].updatedAt?.toString()}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Job Application ID:</Typography>
                  <Typography variant="body2">{stages[selectedStageIdx].jobApplicationId}</Typography>
                </Stack>
                <Box>
                  <Typography variant="body2" color="text.secondary">Notes:</Typography>
                  <Stack spacing={0.5} sx={{ pl: 1 }}>
                    {stages[selectedStageIdx].notes && stages[selectedStageIdx].notes.length > 0
                      ? stages[selectedStageIdx].notes.map((note, idx) => (
                          <Typography key={idx} variant="body2">• {note}</Typography>
                        ))
                      : <Typography variant="body2">No notes.</Typography>
                    }
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box >
  );
};

export default ViewApplicationPage;