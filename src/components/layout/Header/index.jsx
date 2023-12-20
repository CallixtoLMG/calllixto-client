"use client";
import { getUserData } from "@/api/userData";
import { PAGES } from "@/constants";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Menu } from 'semantic-ui-react';
import NoPrint from "../NoPrint";
import { LogDiv, ModContainer, ModLink, Text } from "./styles";

const Header = () => {
  const [token, setToken] = useState(null)
  const [validateToken, setValidateToken] = useState(null)
  const pathname = usePathname();
  const { push } = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('token');
    push(PAGES.LOGIN.BASE);
  };
  useEffect(() => {
    const getToken = localStorage.getItem('token');
    setToken(getToken);
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (userData.isAuthorized) {
          setValidateToken(userData.isAuthorized);
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
    };
    validateToken();
  }, []);
  const routesWithoutHeader = [PAGES.LOGIN.BASE];
  const dynamicRoutePattern = /^\/presupuestos\/[^\/]+\/pdf$/;
  const shouldShowHeader = !routesWithoutHeader.includes(pathname) && !dynamicRoutePattern.test(pathname);
  const routesWithOnlyLogin = [PAGES.BASE];
  const showOnlyLogin = routesWithOnlyLogin.includes(pathname)
  return (
    <NoPrint>
      {shouldShowHeader && token && validateToken &&
        <Menu fixed='top'>
          <ModContainer>
            {showOnlyLogin && !token ? (
              <LogDiv>
                <Menu.Item onClick={handleLogout} > <Text>Ingresar</Text></Menu.Item>
              </LogDiv>
            ) : (
              <>
                <ModLink $destacar={pathname.includes(PAGES.CUSTOMERS.BASE)} href={PAGES.CUSTOMERS.BASE}>
                  <Menu.Item ><Text $destacar={pathname.includes(PAGES.CUSTOMERS.BASE)}>Clientes</Text></Menu.Item>
                </ModLink>
                <ModLink $destacar={pathname.includes(PAGES.PRODUCTS.BASE)} href={PAGES.PRODUCTS.BASE}>
                  <Menu.Item ><Text $destacar={pathname.includes(PAGES.PRODUCTS.BASE)}>Productos</Text></Menu.Item>
                </ModLink>
                <ModLink $destacar={pathname.includes(PAGES.BUDGETS.BASE)} href={PAGES.BUDGETS.BASE}>
                  <Menu.Item ><Text $destacar={pathname.includes(PAGES.BUDGETS.BASE)}>Presupuestos</Text></Menu.Item>
                </ModLink>
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