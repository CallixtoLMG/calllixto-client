'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getUserData } from './api/userData';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [role, setRole] = useState('user');

  useEffect(() => {
    const getData = async () => {
      const sessionData = await getUserData();
      if (sessionData) {
        setUserData(sessionData);
      }
    }

    getData();
  }, []);

  const updateSessionData = useCallback((data) => {
    sessionStorage.setItem("userData", JSON.stringify(data));
    setUserData(data);
  }, []);

  useEffect(() => {
    if (userData?.roles?.length) {
      setRole(userData.roles[0]);
    }
  }, [userData]);

  const getBlacklist = useCallback(() => {
    return userData?.client?.blacklist || [];
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, role, updateSessionData, getBlacklist }}>
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

