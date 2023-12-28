import { getUserData } from '@/api/userData';
import { PAGES } from '@/constants';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export const useRole = () => {
  const [userData, setUserData] = useState(null);
  const { push } = useRouter();

  useEffect(() => {
    async function getData() {
      const data = await getUserData();

      if (!data.isAuthorized) {
        push(PAGES.LOGIN.BASE);
        return;
      }

      setUserData(data);
    }

    getData();
  }, [push]);

  return userData?.roles[0];
}

export const useValidateToken = () => {
  const { push } = useRouter();
  const token = getToken();

  useEffect(() => {
    async function getData() {
      const data = await getUserData();
      if (!token || !data.isAuthorized) {
        push(PAGES.LOGIN.BASE);
      }
    }

    getData();
  }, [push, token]);

  return token;
}

export const useTokenValidated = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function getData() {
      const data = await getUserData();
      setUserData(data);
    }

    getData();
  }, []);

  return userData?.isAuthorized;
}