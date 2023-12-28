import { getUserData } from '@/api/userData';
import { useEffect, useState } from 'react';

export const useRole = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function getData() {
      const data = await getUserData();
      setUserData(data);
    }

    getData();
  }, []);

  return userData?.roles[0];
}