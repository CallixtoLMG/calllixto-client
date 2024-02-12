"use client";
import { useUserContext } from "@/User";
import { NoPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'semantic-ui-react';
import { Container, LogDiv, ModLink, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { userData } = useUserContext();

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem("userData");
    push(PAGES.LOGIN.BASE);
  };

  const routesWithoutHeader = [PAGES.LOGIN.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);
  return (
    <NoPrint>
      {showHeader &&
        <Menu fixed='top'>
          <Container>
            {!userData?.isAuthorized ? (
              <LogDiv>
                <Menu.Item onClick={handleLogout}><Text>Ingresar</Text></Menu.Item>
              </LogDiv>
            ) : (
              <>
                {Object.values(PAGES).filter(page => !!page.NAME).map(page => (
                  <ModLink key={page.BASE} $destacar={pathname.includes(page.BASE)} href={page.BASE}>
                    <Menu.Item><Text $destacar={pathname.includes(page.BASE)}>{page.NAME}</Text></Menu.Item>
                  </ModLink>
                ))}
                <LogDiv>
                  <Menu.Item onClick={handleLogout}><Text>Cerrar sesión</Text></Menu.Item>
                </LogDiv>
              </>
            )}
          </Container>
        </Menu>
      }
    </NoPrint>
  );
};

export default Header;