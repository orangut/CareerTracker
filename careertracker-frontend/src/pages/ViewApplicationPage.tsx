import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Chip, Link, Divider, Rating, IconButton, Paper, List } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useJobApplications } from '../context/JobApplicationContext';
import { getStatusChipStyles, getRemoteOptionChipStyles, formatDate, getSalaryString } from '../utils/helperFunctions.ts';
import StageCard from '../components/StageCard.tsx';
import { useState } from 'react';
import type { Stage } from '../models/stage.ts';
import PrimaryTooltip from '../components/PrimaryTooltip.tsx';

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

  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const stages = job.stages ?? [] as Stage[];

  return (
    <Box sx={{ display: 'flex', gap: 0, px: 4, py: 2 }}>
      {/* Left: Job Details */}
      <Stack spacing={2} sx={{ flex: 1, pr: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant='h6' color='primary' align='left' sx={{
            pt: 2,
            pb: 2,
            fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
            fontWeight: 700,
            textShadow: '1px 2px 8px rgba(0,0,0,0.08)',
            background: 'linear-gradient(90deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}>
            APPLICATION DETAILS
          </Typography>
          {job.isEdit && (
            <PrimaryTooltip title="Edit Job Application" >
              <IconButton size="small">
                <EditIcon color='primary' fontSize="small" onClick={() => navigate(`/edit/${job.id}`)} />
              </IconButton>
            </PrimaryTooltip>
          )}
        </Stack>
        <Typography variant="h5" fontWeight={600}>
          {job.position}
        </Typography>
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
          pb: 2,
          bgcolor: "background.default",
          borderRadius: 2,
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
          maxHeight: '100%',
        }}>
          {/* Scrollable StageCards list */}
          <Stack spacing={2} >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 2 }}>
              <Typography variant='h6' color='primary' align='left' sx={{
                fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
                fontWeight: 700,
                letterSpacing: 2,
                textShadow: '1px 2px 8px rgba(0,0,0,0.08)',
                background: 'linear-gradient(90deg, #1976d2 30%, #42a5f5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}>
                TIMELINE
              </Typography>
              <PrimaryTooltip title="Add Stage" >
                <IconButton size="medium" >
                  <AddIcon color='primary' fontSize="medium" onClick={() => { }} />
                </IconButton>
              </PrimaryTooltip>
            </Stack>
            {stages.length ?
              <List sx={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: '100%',
                minWidth: 180,
                scrollbarWidth: 'none',
              }}>
                {stages.map((stage, idx) => (
                  <Box key={idx} alignItems={'left'} >
                    <StageCard id={idx} isSelected={idx === selectedStageIdx} onSelect={(id) => setSelectedStageIdx(id)} title={stage.type} time={stage.createdAt} />
                    {idx < stages.length - 1 && (
                      <Divider orientation='vertical' flexItem sx={{
                        height: 24,
                        width: 'min-content',
                        ml: 8,
                        bgcolor: 'primary.main',
                      }} >
                      </Divider>
                    )}
                  </Box>
                ))}
              </List> :
              <Box sx={{ minWidth: 180, }}>
                <Typography variant="h6" color="secondary">
                  No stages to display.
                </Typography>
              </Box>}
          </Stack>

          {/* Stage Details */}
          <Box sx={{ flex: 1, pl: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stages.length ?
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
              </Paper> :
              <></>}
          </Box>
        </Box>
      </Box>
    </Box >
  );
};

export default ViewApplicationPage;