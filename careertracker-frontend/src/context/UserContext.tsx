import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';

import {fetchCurrentUser} from "../api/userApi.ts";


export interface User {
    id: string;
    name: string;
    notifications?: string[];
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean; // <-- Added loading here
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for authentication on initial load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetchCurrentUser();
                setUser({id: res._id, name: res.username});
            } catch (error) {
                // If the cookie is expired or invalid, the request will fail
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const value = {user, setUser, loading};

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
