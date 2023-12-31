import { NoPrint } from "@/components/layout";
import { PAGES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, Button as SButton } from 'semantic-ui-react';
import styled from "styled-components";

const Button = styled(SButton)`
  position: fixed!important;
  top: 85px!important;
  left: 25px!important;
  padding: 10px 15px!important;
  display: inline-block!important;
  z-index: 2!important;
`;

const GoBack = () => {
  const { back } = useRouter();
  const pathname = usePathname();
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE, PAGES.NOT_FOUND.BASE];
  const show = !notShow.includes(pathname)
  const handleClick = () => {
    back();
  };
  return (
    <NoPrint>
      {show && <Button onClick={handleClick} color="teal"><Icon name='chevron left' />Atrás</Button>}
    </NoPrint>
  );
};

export default GoBack;
