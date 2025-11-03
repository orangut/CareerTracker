import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Icons
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useUser } from '../context/UserContext';
import NotificationBell from '../components/NotificationBell'

const Header: React.FC = () => {
    const { user, connected } = useUser(); // Cast for TypeScript safety
    const maxCount = 99; // Define constants here or pass them down

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                backgroundColor: 'transparent',
                marginLeft: '50px',
            }}
        >
            {/* --- User Info Section --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircleIcon />
                <Typography variant="h6">
                    Hello {user?.name}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            </Box>
        </Box>
    );
};

export default Header;