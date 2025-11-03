import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUser } from '../context/UserContext';
import NotificationBell from '../components/NotificationBell'
import { AppBar, Badge, IconButton, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
    drawerToggle?: () => void;
    open: boolean;
    drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ drawerToggle, open, drawerWidth }) => {
    const { user, connected } = useUser();
    const maxCount = 99;

    return (
        <AppBar
            sx={{
                display: 'flex',
                mb: 23,
            }}
        >
            {/* --- User Info Section --- */}
            <Toolbar sx={{
                display: 'flex', alignItems: 'center',
                transition: 'margin-left .3s',
                marginLeft: open ? `${drawerWidth - 50}px` : 0,

            }}>
                <IconButton color="inherit" edge="start" onClick={drawerToggle} sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6">
                    Hello {user?.name}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <NotificationBell
                    maxCount={maxCount}
                />
                <Badge
                    overlap="circular"
                    variant="dot"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{
                        ml: 2,
                        '& .MuiBadge-badge': {
                            mr: -1,
                            mb: 0.8,
                            bgcolor: connected ? 'success.main' : 'error.main',
                            color: connected ? 'success.main' : 'error.main',
                            height: 12,
                            minWidth: 12,
                            borderRadius: '50%',
                        },
                    }}
                >
                    <IconButton color="inherit" edge="end" >
                        <AccountCircleIcon />
                    </IconButton>
                </Badge>
            </Toolbar>
        </AppBar>
    );
};

export default Header;