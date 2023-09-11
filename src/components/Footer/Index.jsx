"use client"
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import 'semantic-ui-css/semantic.min.css';
import {
  Container,
  Divider,
  List,
  Segment
} from 'semantic-ui-react';

const Footer = () => {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/iniciarSesion" &&
        <Segment vertical style={{ margin: '1em 0em 0em', padding: '3em 0em' }}>
          <Container textAlign='center'>
            <Divider section />
            <div>
              <Image
                src="/Logo Madera Las Tapias.png"
                alt="Logo Madera Las Tapias.png Logo"
                width={100}
                height={40}
              />
            </div>
            <List horizontal divided link size='small'>
              <List.Item as='a' href='#'>
                Site Map
              </List.Item>
              <List.Item as='a' href='#'>
                Contact Us
              </List.Item>
              <List.Item as='a' href='#'>
                Terms and Conditions
              </List.Item>
              <List.Item as='a' href='#'>
                Privacy Policy
              </List.Item>
            </List>
          </Container>
        </Segment>}
    </>

  )
};

export default Footer;
