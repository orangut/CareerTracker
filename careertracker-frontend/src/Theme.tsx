import {createTheme} from '@mui/material/styles';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleFilledIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1d1d1d',
        },
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

export const getIconAndColor = (key: string) => {
    switch (key) {
        case 'total':
            return {icon: ArrowUpwardIcon, color: '#3f51b5'};
        case 'inProgress':
            return {icon: AccessTimeFilledIcon, color: '#ff9800'};
        case 'interviews':
            return {icon: CheckCircleFilledIcon, color: '#4caf50'};
        case 'offers':
            return {icon: ArrowDownwardIcon, color: '#9c27b0'};
        default:
            return {icon: ArrowUpwardIcon, color: '#3f51b5'};
    }
};
