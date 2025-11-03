import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import { type Notification } from '../models/notification.ts';
import NotificationMenuItem from './NotificationMenuItem.tsx';


interface NotificationBellProps {
    maxCount: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ maxCount }) => {
    const navigate = useNavigate();
    const { user, toggleNotificationReadStatus } = useUser()
    const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const userNotifications = (user?.notifications || []) as Notification[];
        setLocalNotifications(userNotifications.map(notif => ({ ...notif, isRead: notif.isRead ?? false })));
    }, [user]);


    const unreadNotifications = localNotifications.filter(notif => !notif.isRead);
    const notificationCount = unreadNotifications.length;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigateToApplication = async (
        notification: Notification
    ) => {
        if (!notification.jobApplicationId) {
            return;
        }
        const path = `/view/${notification.jobApplicationId}`;
        handleMenuClose();

        // Mark as read when navigating
        if (!notification.isRead) {
            toggleNotificationReadStatus(notification.id.toString());
        }
        navigate(path);
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    color="inherit"
                    aria-controls={open ? 'notification-menu' : undefined}
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                    edge="end"
                >
                    <Badge
                        badgeContent={notificationCount}
                        color="error"
                        max={maxCount}
                        invisible={notificationCount === 0}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: { sx: { maxHeight: 400, maxWidth: 380, minWidth: 280 } },
                }}
            >
                {
                    localNotifications.length === 0 ? (
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                No notifications to display.
                            </Typography>
                        </MenuItem>
                    ) : ([
                        <MenuItem key={"header"} disableRipple>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Notifications ({unreadNotifications.length} unread)
                            </Typography>
                        </MenuItem>,
                        <Divider key={"firstDivider"} sx={{ my: 0.5 }} />,
                        ...localNotifications.map((notif) => (
                            <NotificationMenuItem
                                key={`notif menue item ${notif.id}`}
                                notification={notif}
                                onNavigate={handleNavigateToApplication} />
                        )),
                        < Divider key={"secondDivider"} sx={{ my: 0.5 }} />,
                        <MenuItem key={"footer"} onClick={handleMenuClose}>
                            <Typography variant="caption" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
                                View All Notifications
                            </Typography>
                        </MenuItem>
                    ])
                }
            </Menu>
        </>
    );
};

export default NotificationBell;