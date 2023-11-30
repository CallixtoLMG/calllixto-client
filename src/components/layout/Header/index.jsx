"use client";
import { PAGES } from "@/constants";
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Container, Menu } from 'semantic-ui-react';
import { LogOutDiv, ModContainer, ModLink, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push(PAGES.LOGIN.BASE);
  };
  useEffect(() => {
  }, []);

  return (
    <>
      {pathname !== "/login" &&
        <Menu fixed='top'>
          <ModContainer>
            <Menu.Item >
              <Container fluid>
                <Image
                  src="/Callixto.png"
                  alt="Callixto logo"
                  width={90}
                  height={30}
                />
              </Container>
            </Menu.Item>
            <ModLink $destacar={pathname.includes(PAGES.CUSTOMERS.BASE)} href={PAGES.CUSTOMERS.BASE}>
              <Menu.Item ><Text $destacar={pathname.includes(PAGES.CUSTOMERS.BASE)}>Clientes</Text></Menu.Item>
            </ModLink>
            <ModLink $destacar={pathname.includes(PAGES.BUDGETS.BASE)} href={PAGES.BUDGETS.BASE}>
              <Menu.Item ><Text $destacar={pathname.includes(PAGES.BUDGETS.BASE)}>Presupuestos</Text></Menu.Item>
            </ModLink>
            <ModLink $destacar={pathname.includes(PAGES.PRODUCTS.BASE)} href={PAGES.PRODUCTS.BASE}>
              <Menu.Item ><Text $destacar={pathname.includes(PAGES.PRODUCTS.BASE)}>Productos</Text></Menu.Item>
            </ModLink>
            <LogOutDiv>
              <Menu.Item onClick={handleLogout} > <Text>Cerrar sesión</Text></Menu.Item>
            </LogOutDiv>
          </ModContainer>
        </Menu>
      }
    </>
  )
};


export default Header;