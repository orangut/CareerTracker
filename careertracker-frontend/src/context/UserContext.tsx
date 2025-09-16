import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  notifications?: string[];
}

interface UserContextType {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
