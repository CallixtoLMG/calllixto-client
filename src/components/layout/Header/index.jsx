"use client";
import { PAGES } from "@/constants";
import { usePathname } from 'next/navigation';
import { Menu } from 'semantic-ui-react';
import NoPrint from "../NoPrint";
import { LogDiv, ModContainer, ModLink, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  return (
    <NoPrint>
      <Menu fixed='top'>
        <ModContainer>
          {Object.values(PAGES).filter(page => !!page.NAME).map(page => (
            <ModLink key={page.BASE} $destacar={pathname.includes(page.BASE)} href={page.BASE}>
              <Menu.Item><Text $destacar={pathname.includes(page.BASE)}>{page.NAME}</Text></Menu.Item>
            </ModLink>
          ))}
          <LogDiv>
            <Menu.Item><Text>Cerrar sesión</Text></Menu.Item>
          </LogDiv>
        </ModContainer>
      </Menu>
    </NoPrint>
  );
};

export default Header;