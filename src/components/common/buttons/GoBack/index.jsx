import { NoPrint } from "@/components/layout";
import { PAGES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from 'semantic-ui-react';
import { ModButton } from "./styles";

const GoBack = () => {
  const { back } = useRouter();
  const pathname = usePathname();
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE, PAGES.NOTFOUND.BASE];
  const show = !notShow.includes(pathname)
  const handleClick = () => {
    back();
  };
  return (
    <NoPrint>
      {show && <ModButton onClick={handleClick} color="teal"><Icon name='chevron left' />  Atrás</ModButton>}
    </NoPrint>
  );
};

export default GoBack;