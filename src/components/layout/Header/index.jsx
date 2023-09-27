"use client";
import { PAGES } from "@/constants";
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Container,
  Menu
} from 'semantic-ui-react';
import {
  ModLink, Text
} from "./styles";

const Header = () => {
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/login" &&
        <Menu fixed='top'>
          <Container>
            <Menu.Item >
              <div>
                <Image
                  src="/Callixto.png"
                  alt="Callixto logo"
                  width={90}
                  height={30}
                />
              </div>
            </Menu.Item>
            <ModLink href={PAGES.LOGIN.BASE}>
              <Menu.Item > <Text>Cerrar sesión</Text></Menu.Item>
            </ModLink>
            <ModLink $destacar={pathname.includes(PAGES.CUSTOMERS.BASE)} href={PAGES.CUSTOMERS.BASE}>
              <Menu.Item ><Text $destacar={pathname.includes(PAGES.CUSTOMERS.BASE)}>Clientes</Text></Menu.Item>
            </ModLink>
            <ModLink $destacar={pathname.includes(PAGES.BUDGETS.BASE)} href={PAGES.BUDGETS.BASE}>
              <Menu.Item ><Text $destacar={pathname.includes(PAGES.BUDGETS.BASE)}>Presupuestos</Text></Menu.Item>
            </ModLink>
            <ModLink $destacar={pathname.includes(PAGES.PRODUCTS.BASE)} href={PAGES.PRODUCTS.BASE}>
              <Menu.Item ><Text $destacar={pathname.includes(PAGES.PRODUCTS.BASE)}>Productos</Text></Menu.Item>
            </ModLink>

          </Container>
        </Menu>
      }
    </>
  )
};


export default Header;