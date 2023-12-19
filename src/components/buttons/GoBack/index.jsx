import { PAGES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from 'semantic-ui-react';
import { ModButton } from "./styles";
import NoPrint from '@/components/layout/NoPrint';

const GoBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE, PAGES.NOTFOUND.BASE];
  const show = !notShow.includes(pathname)
  const handleClick = () => {
    router.back();
  };
  return (
    <NoPrint>
      {show && <ModButton onClick={handleClick} color="teal"><Icon name='chevron left' />  Atrás</ModButton>}
    </NoPrint>
  );
};

export default GoBack;