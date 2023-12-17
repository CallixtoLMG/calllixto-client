import { PAGES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from 'semantic-ui-react';
import { ModButton } from "./styles";

const GoBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE];
  const show = !notShow.includes(pathname)
  const handleClick = () => {
    router.back();
  };
  return (
    <>
      {show && <ModButton onClick={handleClick} color="teal"><Icon name='chevron left' />  Atrás</ModButton>}
    </>
  );
};

export default GoBack;