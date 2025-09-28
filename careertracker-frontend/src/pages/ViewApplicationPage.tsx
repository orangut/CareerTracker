import { useParams } from 'react-router-dom';
import { useJobApplications } from '../context/JobApplicationContext';
import { Box, Paper, Typography, Stack, Chip, Link, Divider } from '@mui/material';

const ViewApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { readJobApplication } = useJobApplications();
  const job = id ? readJobApplication(id) : undefined;

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
    <Box sx={{ display: 'flex', gap: 4, p: 4 }}>
      {/* Left: Job Details */}
      <Paper elevation={3} sx={{ flex: 1, p: 3, minWidth: 340 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            {job.position}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {job.company}
          </Typography>
          <Divider />
          <Typography>
            <strong>Location:</strong> {job.location}
          </Typography>
          <Typography>
            <strong>Date Applied:</strong> {typeof job.applicationDate === 'string' ? job.applicationDate : job.applicationDate.toLocaleString()}
          </Typography>
          <Typography>
            <strong>Interest Level:</strong> {job.interestLevel}
          </Typography>
          <Typography>
            <strong>Remote Option:</strong>{' '}
            <Chip label={job.remoteOption} color="primary" size="small" />
          </Typography>
          <Typography>
            <strong>Status:</strong>{' '}
            <Chip label={job.currentStage} color="secondary" size="small" />
          </Typography>
          {job.salaryMin && job.salaryMax && (
            <Typography>
              <strong>Salary:</strong> ${job.salaryMin} - ${job.salaryMax}
            </Typography>
          )}
          <Typography>
            <strong>Job URL:</strong>{' '}
            <Link href={job.jobUrl} target="_blank" rel="noopener">
              {job.jobUrl}
            </Link>
          </Typography>
          {job.notes && job.notes.length > 0 && (
            <Box>
              <Typography fontWeight={500}>Notes:</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {[job.notes].map((note, idx) => (
                  <Typography key={idx} variant="body2">
                    • {note}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Right: Stages Display (placeholder) */}
      <Paper elevation={3} sx={{ flex: 1, p: 3, minWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Stages display goes here
        </Typography>
      </Paper>
    </Box>
  );
};

export default ViewApplicationPage;