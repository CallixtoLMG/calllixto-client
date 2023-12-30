"use client";
import { PAGES } from "@/constants";
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { List } from 'semantic-ui-react';
import { ModContainer } from "./styles";
import { Segment } from "@/components/common/forms";

const Footer = () => {
  const pathname = usePathname();
  return (
    <>
      {pathname !== PAGES.LOGIN.BASE &&
        <Segment>
          <ModContainer >
            <div>
              <Image
                src="/callixto.png"
                alt="Callixto logo"
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
          </ModContainer>
        </Segment>
      }
    </>
  )
};

export default Footer;
