'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserData } from './api/userData';
import { setUserData as setSessionUserData } from './services/session';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [role, setRole] = useState('user');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const sessionData = await getUserData();
      if (sessionData) {
        setUserData(sessionData);
      }
      setIsSessionLoading(false);
    }

    getData();
  }, []);

  useEffect(() => {
    if (userData?.roles?.length) {
      setRole(userData.roles[0]);
    }
  }, [userData]);

  const updateUserData = (data) => {
    setUserData(data);
    if (data?.isAuthorized) {
      setSessionUserData(data);
    }
  };

  return (
    <UserContext.Provider value={{ userData, setUserData: updateUserData, role, isSessionLoading }}>
      {children}
    </UserContext.Provider>
  );
};

const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export { UserProvider, useUserContext };

