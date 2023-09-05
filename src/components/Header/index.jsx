"use client"
import Image from 'next/image';
import {
  Container,
  Menu
} from 'semantic-ui-react';
import {
  ModLink
} from "./styles";

const Header = () => {
  return (
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
          <ModLink href='/iniciarSesion'>
            <Menu.Item >Cerrar sesión</Menu.Item>
          </ModLink>
          <ModLink href='/productos'>
            <Menu.Item >Productos</Menu.Item>
          </ModLink>
          <ModLink href='/presupuestos'>
            <Menu.Item >Presupuestos</Menu.Item>
          </ModLink>
        </Container>
      </Menu>
    </div>
  )
};


export default Header;