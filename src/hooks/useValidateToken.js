import { useUserContext } from '@/User';
import { PAGES } from '@/common/constants';
import { clearSession, getToken, isSessionExpired } from '@/services/session';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const useValidateToken = () => {
  const { push } = useRouter();
  const { userData, isSessionLoading } = useUserContext();

  useEffect(() => {
    if (isSessionLoading) return;

    const token = getToken();
    if (!token || isSessionExpired()) {
      clearSession();
      push(PAGES.LOGIN.BASE);
      return;
    }

    if (userData.hasOwnProperty('isAuthorized') && !userData.isAuthorized) {
      clearSession();
      push(PAGES.LOGIN.BASE);
    }
  }, [isSessionLoading, push, userData]);
};

export default useValidateToken;
