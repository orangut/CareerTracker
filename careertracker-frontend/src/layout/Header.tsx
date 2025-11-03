import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUser } from '../context/UserContext';
import NotificationBell from '../components/NotificationBell'
import { AppBar, IconButton, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
    drawerToggle?: () => void;
    open: boolean;
    drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ drawerToggle, open, drawerWidth }) => {
    const { user, connected } = useUser(); // Cast for TypeScript safety
    const maxCount = 99; // Define constants here or pass them down

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
                <Box
                    aria-label={connected ? 'online' : 'offline'}
                    title={connected ? 'Online' : 'Offline'}
                    sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: connected ? 'success.main' : 'error.main',
                        boxShadow: 1,
                    }}
                />
                {/* --- Notification Bell Component --- */}
                <NotificationBell
                    maxCount={maxCount}
                />
                <IconButton color="inherit" edge="end" sx={{ ml: 2 }}>
                    <AccountCircleIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;