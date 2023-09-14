"use client"
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import 'semantic-ui-css/semantic.min.css';
import {
  Container,
  List
} from 'semantic-ui-react';
import {
  ModSegment
} from "./styles";

const Footer = () => {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/iniciarSesion" &&
        <ModSegment>
          <Container textAlign='center'>
            <div>
              <Image
                src="/Logo Madera Las Tapias.png"
                alt="Logo Madera Las Tapias.png Logo"
                width={100}
                height={40}
              />
            </div>
            <List link size='small'>
              <List.Item as='a' href='#'>
                © Copyright 2023 - Todos los derechos reservados por la empresa CallixtoGLM
              </List.Item>
              <List.Item as='a' href='#'>
                Contactanos
              </List.Item>
            </List>
          </Container>
        </ModSegment >}
    </>
  )
};

export default Footer;
