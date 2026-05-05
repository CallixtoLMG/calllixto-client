import { useUserContext } from '@/User';
import { PAGES } from '@/common/constants';
import { expireSession, getToken, isSessionExpired } from '@/services/session';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const useValidateToken = () => {
  const { push } = useRouter();
  const { userData, isSessionLoading } = useUserContext();

  useEffect(() => {
    if (isSessionLoading) return;

    const token = getToken();
    if (!token || isSessionExpired()) {
      expireSession();
      push(PAGES.LOGIN.BASE);
      return;
    }

    if (userData.hasOwnProperty('isAuthorized') && !userData.isAuthorized) {
      expireSession();
      push(PAGES.LOGIN.BASE);
    }
  }, [isSessionLoading, push, userData]);
};

export default useValidateToken;
