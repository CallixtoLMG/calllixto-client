'use client';
import { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (userData?.roles?.length) {
      setRole(userData.roles[0]);
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, role }}>
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
