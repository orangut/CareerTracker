import { Box, IconButton, ListItemText, MenuItem, Tooltip, Typography } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Notification } from '../models/notification.ts';
import { useUser } from "../context/UserContext.tsx";

interface NotificationMenuItemProps {
    notification: Notification;
    onNavigate: (notification: Notification) => Promise<void>;
}

const NotificationMenuItem: React.FC<NotificationMenuItemProps> = ({
    notification: notif,
    onNavigate,
}) => {
    const { removeNotification, toggleNotificationReadStatus } = useUser()
    return (
        <MenuItem
            disableRipple
            onClick={(e: React.MouseEvent<HTMLLIElement>) => e.stopPropagation()}
            sx={{
                whiteSpace: 'normal',
                backgroundColor: !notif.isRead ? 'action.hover' : 'inherit',
                '&:hover': {
                    backgroundColor: !notif.isRead ? 'action.selected' : 'action.hover',
                },
                display: 'flex',
                alignItems: 'center',
                py: 1,
            }}
        >
            <ListItemText
                primary={
                    <Typography variant="body2" fontWeight={!notif.isRead ? 'bold' : 'normal'}>
                        {notif.message}
                    </Typography>
                }
                sx={{ flexGrow: 1, mr: 1 }}
            />

            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                {notif.jobApplicationId && (
                    <Tooltip title="Go to Application">
                        <IconButton
                            size="small"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    await onNavigate(notif);
                                } catch (error) {
                                    console.error("Navigation failed:", error);
                                }
                            }}
                            color="primary"
                        >
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title={notif.isRead ? "Mark as unread" : "Mark as read"}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            try {
                                toggleNotificationReadStatus(notif.id.toString());
                            } catch (error) {
                                console.error("Error toggling read status:", error);
                            }
                        }}
                    >
                        {notif.isRead ? (
                            <MarkEmailReadIcon fontSize="small" color="action" />
                        ) : (
                            <MarkEmailUnreadIcon fontSize="small" color="primary" />
                        )}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete notification">
                    <IconButton
                        size="small"
                        onClick={async (e) => {
                            e.stopPropagation();
                            try {
                                removeNotification(notif.id.toString());
                            } catch (error) {
                                console.error("Failed to delete notification:", error);
                            }
                        }}
                        color="error"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </MenuItem>
    );
};

export default NotificationMenuItem;