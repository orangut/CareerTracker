import { Box, Grid, styled, Typography } from '@mui/material';
import { metricsConfig, type MetricsData } from "../../models/DashboardMetrics.ts";
import { type JobApplication } from "../../models/JobApplication.ts";

const StyledMetricCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.2s',
    minWidth: 180, // Add this line to set a fixed width
    '&:hover': {
        transform: 'scale(1.02)',
    },
}));

const StyledIconButton = styled(Box)<{
    color: string
}>(({ color }) => ({
    width: 48,
    height: 48,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
    color: 'white',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
}));


const Metrics = (jobData: JobApplication[]) => {
    const calculateMetrics = (jobs: Array<JobApplication>): MetricsData => {
        const totalApplications = jobs.length;
        const inProgress = jobs.filter(
            (job) =>
                !['rejected', 'withdrawn', 'offer'].includes(job.lastStageType),
        ).length;
        const interviews = jobs.filter((job) =>
            ['phone_screen', 'technical_interview', 'final_interview'].includes(
                job.lastStageType,
            ),
        ).length;
        const offers = jobs.filter((job) => job.lastStageType === 'offer').length;

        return {
            total: totalApplications,
            inProgress,
            interviews,
            offers,
        };
    };


    const metrics: MetricsData = calculateMetrics(jobData);

    return (
        <Grid container spacing={5} sx={{ mb: 4 }} >
            {(Object.entries(metrics) as [keyof MetricsData, number][]).map(([key, value]) => {
                const { icon: IconComponent, color: iconColor, title } = metricsConfig[key];

                return (
                    <Grid key={key} sx={{ xs: 12, sm: 6, md: 3 }}>
                        <StyledMetricCard>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    {title}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {value}
                                </Typography>
                            </Box>
                            <StyledIconButton color={iconColor}>
                                <IconComponent sx={{ fontSize: '2rem' }} />
                            </StyledIconButton>
                        </StyledMetricCard>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default Metrics;