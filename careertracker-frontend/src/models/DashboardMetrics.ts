import type {SvgIconComponent} from "@mui/icons-material";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';


export interface MetricsData {
    total: number;
    inProgress: number,
    interviews: number,
    offers: number,
}

interface MetricConfig {
    title: string;
    icon: SvgIconComponent;
    color: string;
}


export const metricsConfig: Record<keyof MetricsData, MetricConfig> = {
    total: {
        title: 'Total Applications',
        icon: ArrowRightAltIcon,
        color: '#3f51b5',
    },
    inProgress: {
        title: 'In Progress',
        icon: ArrowRightAltIcon,
        color: '#ff9800',
    },
    interviews: {
        title: 'Interviews',
        icon: ArrowRightAltIcon,
        color: '#4caf50',
    },
    offers: {
        title: 'Offers',
        icon: ArrowRightAltIcon,
        color: '#9c27b0',
    },
};