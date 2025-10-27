import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import {useNavigate} from 'react-router-dom'; // Import NavigateFunction type

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Define the TypeScript Interface for a Notification
export interface Notification {
    id: string | number;
    message: string;
    isRead: boolean;
    jobApplicationId: string;
    // ... other properties
}

// Define the Props for the NotificationBell component
interface NotificationBellProps {
    userNotifications: Notification[] | undefined;
    maxCount: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({userNotifications = [], maxCount}) => {
    // Note: The structure of the user object is abstracted,
    // we only work with the notification array provided via props.

    const navigate = useNavigate();

    // Use local state to manage the notification list
    const [localNotifications, setLocalNotifications] = React.useState<Notification[]>(
        userNotifications.map(notif => ({...notif, isRead: notif.isRead ?? false}))
    );

    const unreadNotifications = localNotifications.filter(notif => !notif.isRead);
    const notificationCount = unreadNotifications.length;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleToggleReadStatus = async (notificationId: string | number) => {
        console.log(`[API Call] Toggling read status for ID: ${notificationId}`);
        setLocalNotifications(prevNotifs =>
            prevNotifs.map(notif =>
                notif.id === notificationId ? {...notif, isRead: !notif.isRead} : notif
            )
        );
        // FUTURE: API call here
    };

    const handleDeleteNotification = async (notificationId: string | number) => {
        console.log(`[API Call] Deleting notification with ID: ${notificationId}`);
        setLocalNotifications(prevNotifs =>
            prevNotifs.filter(notif => notif.id !== notificationId)
        );
        // FUTURE: API call here
    };

    const handleNavigateToApplication = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        notification: Notification
    ) => {
        e.stopPropagation();

        if (!notification.jobApplicationId) {
            console.warn("Attempted to navigate, but jobApplicationId is missing.");
            return;
        }

        const path = `/view/${notification.jobApplicationId}`;
        console.log(`[Navigation] Navigating to job application: ${path}`);

        handleMenuClose();

        // Mark as read when navigating
        if (!notification.isRead) {
            await handleToggleReadStatus(notification.id);
        }

        navigate(path);
    };

    // --- RENDER ---

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    color="inherit"
                    aria-controls={open ? 'notification-menu' : undefined}
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                >
                    <Badge
                        badgeContent={notificationCount}
                        color="error"
                        max={maxCount}
                        invisible={notificationCount === 0}
                    >
                        <NotificationsIcon/>
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
                slotProps={{
                    paper: {sx: {maxHeight: 400, maxWidth: 380, minWidth: 280}},
                }}
            >
                {localNotifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No notifications to display.
                        </Typography>
                    </MenuItem>
                ) : (
                    <>
                        <MenuItem disableRipple>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Notifications ({unreadNotifications.length} unread)
                            </Typography>
                        </MenuItem>
                        <Divider sx={{my: 0.5}}/>

                        {localNotifications.map((notif) => (
                            <MenuItem
                                key={notif.id}
                                disableRipple
                                onClick={(e: React.MouseEvent<HTMLLIElement>) => e.stopPropagation()}
                                sx={{
                                    whiteSpace: 'normal',
                                    // Subtle grey background for UNREAD
                                    backgroundColor: !notif.isRead ? 'action.hover' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: !notif.isRead ? 'action.selected' : 'action.hover',
                                    },
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: 1,
                                }}
                            >
                                {/* Notification Message (Primary Click Area) */}
                                <ListItemText
                                    // Ensure this internal onClick is removed or correctly handled if needed
                                    // The outer MenuItem onClick should handle most default behavior
                                    primary={
                                        <Typography variant="body2" fontWeight={!notif.isRead ? 'bold' : 'normal'}>
                                            {notif.message}
                                        </Typography>
                                    }
                                    sx={{flexGrow: 1, mr: 1}}
                                />

                                <Box sx={{display: 'flex', gap: 0.5, flexShrink: 0}}>

                                    {/* 1. Navigation Icon */}
                                    {notif.jobApplicationId && (
                                        <Tooltip title="Go to Application">
                                            <IconButton
                                                size="small"
                                                // Define the wrapper function as async
                                                onClick={async (e) => {
                                                    e.stopPropagation();

                                                    // Call the async function directly. Use try/catch for robustness.
                                                    try {
                                                        await handleNavigateToApplication(e, notif);
                                                    } catch (error) {
                                                        console.error("Navigation failed:", error);
                                                        // Handle error, maybe display a snackbar message
                                                    }
                                                }}
                                                color="primary"
                                            >
                                                <OpenInNewIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {/* 2. Mark Read/Unread Toggle */}
                                    <Tooltip title={notif.isRead ? "Mark as unread" : "Mark as read"}>
                                        <IconButton
                                            size="small"
                                            // Define the inline function as async
                                            onClick={async (e) => {
                                                e.stopPropagation();

                                                // Await the asynchronous function call
                                                try {
                                                    await handleToggleReadStatus(notif.id);
                                                } catch (error) {
                                                    // Good practice: Log or handle API errors here
                                                    console.error("Error toggling read status:", error);
                                                }
                                            }}
                                        >
                                            {notif.isRead ? (
                                                <MarkEmailReadIcon fontSize="small" color="action"/>
                                            ) : (
                                                <MarkEmailUnreadIcon fontSize="small" color="primary"/>
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    {/* 3. Delete Notification Icon */}
                                    <Tooltip title="Delete notification">
                                        <IconButton
                                            size="small"
                                            // Define the inline function as async to handle the promise returned by handleDeleteNotification
                                            onClick={async (e) => {
                                                e.stopPropagation();

                                                // Call the async function and await its completion (optional, but good practice)
                                                try {
                                                    await handleDeleteNotification(notif.id);
                                                } catch (error) {
                                                    // IMPORTANT: Handle any errors from the Flask request here
                                                    console.error("Failed to delete notification:", error);
                                                    // Optionally show a user-facing error message (e.g., using a Snackbar)
                                                }
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </MenuItem>
                        ))}

                        <Divider sx={{my: 0.5}}/>
                        <MenuItem onClick={handleMenuClose}>
                            <Typography variant="caption" color="primary" sx={{width: '100%', textAlign: 'center'}}>
                                View All Notifications
                            </Typography>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;