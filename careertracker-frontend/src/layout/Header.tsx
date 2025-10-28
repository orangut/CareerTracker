import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUser } from '../context/UserContext';
import NotificationBell from '../components/NotificationBell'
import { type Notification } from '../components/NotificationBell'
import { AppBar, IconButton, Toolbar } from '@mui/material';

interface HeaderProps {
    drawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ drawerToggle }) => {
    const { user } = useUser(); // Cast for TypeScript safety
    const maxCount = 99; // Define constants here or pass them down

    return (
        <AppBar
            sx={{
                display: 'flex',
                // justifyContent: 'space-between',
                // alignItems: 'center',
                mb: 23,
                // backgroundColor: 'transparent',
                // marginLeft: '50px',
            }}
        >
            {/* --- User Info Section --- */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="inherit" edge="start" onClick={drawerToggle} sx={{ mr: 2 }}>
                    <AccountCircleIcon />
                </IconButton>
                <Typography variant="h6">
                    Hello {user?.name}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {/* --- Notification Bell Component --- */}
                <NotificationBell
                    userNotifications={user?.notifications as Notification[]}
                    maxCount={maxCount}
                />
            </Toolbar>
        </AppBar>
    );
};

export default Header;