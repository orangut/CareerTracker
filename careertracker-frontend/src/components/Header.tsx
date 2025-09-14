import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Header = ({ username, notificationCount }: { username: string; notificationCount: number }) => {
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircleIcon />
                <Typography variant="h6">
                    Hello {username}
                </Typography>
            </Box>
            <IconButton color="inherit">
                <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        </Box>
    );
};

export default Header;