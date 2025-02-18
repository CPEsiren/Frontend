import { createContext, useContext, useState, ReactNode } from 'react';
import { IUser } from '../interface/InterfaceCollection';

// Create a context with a default value of null
const UserContext = createContext<{ user: IUser | null, setUserData: (user: IUser) => void }>({
  user: null,
  setUserData: () => {}
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const setUserData = (user: IUser) => {
    setUser(user);
  };

  return (
    <UserContext.Provider value={{ user, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user data from the context
export const useUser = () => useContext(UserContext);
