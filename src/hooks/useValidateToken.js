import { useUserContext } from '@/User';
import { PAGES } from '@/common/constants';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const useValidateToken = () => {
  const { push } = useRouter();
  const { userData } = useUserContext();

  useEffect(() => {
    async function getData() {
      if (userData.hasOwnProperty('isAuthorized') && !userData.isAuthorized) {
        push(PAGES.LOGIN.BASE);
      }
    }
    getData();
  }, [push, userData]);
};

export default useValidateToken;
