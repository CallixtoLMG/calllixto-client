"use client";
import { getUserData } from "@/api/userData";
import { NoPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Menu } from 'semantic-ui-react';
import { LogDiv, ModContainer, ModLink, Text } from "./styles";

const Header = () => {
  const [validatedToken, setValidatedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { push } = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem("userData");
    push(PAGES.LOGIN.BASE);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const validateToken = async () => {
        try {
          const userData = await getUserData();
          setValidatedToken(userData?.isAuthorized);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          console.error('Error, ingreso no valido(token):', error);
        };
      };
      validateToken();
    };
  }, [pathname]);

  const routesWithoutHeader = [PAGES.LOGIN.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);
  return (
    <NoPrint>
      {showHeader &&
        <Menu fixed='top'>
          <ModContainer>
            {isLoading ? (
              <></>
            ) : !validatedToken ? (
              <LogDiv>
                <Menu.Item onClick={handleLogout} > <Text>Ingresar</Text></Menu.Item>
              </LogDiv>
            ) : (
              <>
                {Object.values(PAGES).filter(page => !!page.NAME).map(page => (
                  <ModLink key={page.BASE} $destacar={pathname.includes(page.BASE)} href={page.BASE}>
                    <Menu.Item><Text $destacar={pathname.includes(page.BASE)}>{page.NAME}</Text></Menu.Item>
                  </ModLink>
                ))}
                <LogDiv>
                  <Menu.Item onClick={handleLogout} > <Text>Cerrar sesión</Text></Menu.Item>
                </LogDiv>
              </>
            )}
          </ModContainer>
        </Menu>
      }
    </NoPrint>
  );
};

export default Header;