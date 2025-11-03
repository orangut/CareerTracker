import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { fetchCurrentUser } from "../api/userApi.ts";
import { connectSocket } from '../webSocket/socket.ts';


export interface User {
    id: string;
    name: string;
    notifications?: object[];
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean; // <-- Added loading here
    connected: boolean;
    removeNotification: (notificationId: string) => void;
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
                // If the cookie is expired or invalid, the request will fail
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
                addNotification(notification);
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
    }, [user]);

    const addNotification = (notification: object) => {
        setUser((prevUser) => {
            return {
                ...prevUser!,
                notifications: prevUser ? [notification, ...(prevUser.notifications || [])] : [notification],
            }
        });
    };
    const removeNotification = (notificationId: string) => {
        setUser((prevUser) => {
            return {
                ...prevUser!,
                notifications: prevUser?.notifications?.filter((notif: any) => notif.id !== notificationId) || [],
            }
        });
    };
    const value = { user, setUser, loading, connected: socketConnected, removeNotification};

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
