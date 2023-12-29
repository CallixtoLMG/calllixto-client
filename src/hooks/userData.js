import { getUserData } from '@/api/userData';
import { PAGES } from '@/constants';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  return 'user';
}

export const useValidateToken = () => {
  const { push } = useRouter();

  useEffect(() => {
    async function getData() {
      const data = await getUserData();
      if (!data.isAuthorized) {
        push(PAGES.LOGIN.BASE);
      }
    }

    getData();
  }, [push]);
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