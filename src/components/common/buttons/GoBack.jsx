import { PAGES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, Button } from 'semantic-ui-react';

const GoBack = () => {
  const { back } = useRouter();
  const pathname = usePathname();
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE, PAGES.NOT_FOUND.BASE];
  const show = !notShow.includes(pathname)
  const handleClick = () => {
    back();
  };
  return (
    <>
      {show && <Button onClick={handleClick} color="teal" circular icon><Icon name='chevron left' /></Button>}
    </>
  );
};

export default GoBack;
