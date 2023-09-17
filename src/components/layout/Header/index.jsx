"use client"
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import {
  Container,
  Menu
} from 'semantic-ui-react';
import {
  ModLink, Text
} from "./styles";

const Header = () => {

  const pathname = usePathname();
  const [destacarProducto, setDestacarProducto] = useState(null);
  const [destacarPresupuesto, setDestacarPresupuesto] = useState(null);

  useEffect(() => {
    pathname === "/productos" ? setDestacarProducto(true) : setDestacarProducto(null);
    pathname === "/presupuestos" ? setDestacarPresupuesto(true) : setDestacarPresupuesto(null);
  },[]);

  return (
    <>
      {pathname !== "/login" &&
        <div>
          <Menu fixed='top'>
            <Container>
              <Menu.Item >
                <div>
                  <Image
                    src="/Logo Madera Las Tapias.png"
                    alt="Logo Madera Las Tapias.png Logo"
                    width={90}
                    height={30}
                  />
                </div>
              </Menu.Item>
              <ModLink href='/login'>
                <Menu.Item > <Text>Cerrar sesión</Text></Menu.Item>
              </ModLink>
              <ModLink $destacar={destacarProducto} href='/productos'>
                <Menu.Item ><Text $destacar={destacarProducto}>Productos</Text></Menu.Item>
              </ModLink>
              <ModLink $destacar={destacarPresupuesto} href='/presupuestos'>
                <Menu.Item ><Text $destacar={destacarPresupuesto}>Presupuestos</Text></Menu.Item>
              </ModLink>
            </Container>
          </Menu>
        </div>}
    </>
  )
};


export default Header;