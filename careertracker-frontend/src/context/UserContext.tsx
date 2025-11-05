import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { fetchCurrentUser } from "../api/userApi.ts";
import { connectSocket } from '../webSocket/socket.ts';
import { type Notification } from '../models/notification.ts';
import { deleteNotification, editNotificationReadStatus } from '../api/notificationsApi.ts';



export interface User {
    id: string;
    name: string;
    notifications?: Notification[];
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    connected: boolean;
    removeNotification: (notificationId: string) => void;
    toggleNotificationReadStatus: (notificationId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [socketConnected, setSocketConnected] = useState(false);

    // Check for authentication on initial load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetchCurrentUser();
                setUser({ id: res._id, name: res.username, notifications: res.notifications });
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user) return;
        connectSocket({
            onNotification: (notification: object) => {
                addNotification(notification as Notification);
            },
            onOpen: () => {
                setSocketConnected(true);
            },
            onClose: () => {
                setSocketConnected(false);
            },
            onError: () => {
                setSocketConnected(false);
            }
        });
    }, [user?.id]);

    const addNotification = (notification: Notification) => {
        setUser((prevUser) => {
            return {
                ...prevUser!,
                notifications: prevUser ? [notification, ...(prevUser.notifications || [])] : [notification],
            }
        });
    };
    const toggleNotificationReadStatus = async (notificationId: string) => {
        try {
            const newIsRead = !(user?.notifications?.find((notif: any) => notif.id === notificationId)?.isRead);
            const editedNotification = await editNotificationReadStatus(notificationId, { isRead: newIsRead });
            setUser((prevUser) => {
                return {
                    ...prevUser!,
                    notifications: prevUser?.notifications?.map((notif: any) => notif.id === notificationId ? editedNotification : notif),
                }
            })
        } catch (error) { }
    };
    const removeNotification = async (notificationId: string) => {
        try {
            const res = await deleteNotification(notificationId);
            if (res.status === 200 || res.status === 201) {
                setUser((prevUser) => {
                    return {
                        ...prevUser!,
                        notifications: prevUser?.notifications?.filter((notif: any) => notif.id !== notificationId) || [],
                    }
                });
            }
        } catch (error) { }
    };
    const value = { user, setUser, loading, connected: socketConnected, removeNotification, toggleNotificationReadStatus };

    if (loading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
