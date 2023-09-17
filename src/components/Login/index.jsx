"use client";
import Image from 'next/image';
import Link from 'next/link';
import 'semantic-ui-css/semantic.min.css';
import { Form, Header, Message, Segment } from 'semantic-ui-react';
import { ModButton2, ModGrid, ModGridColumn, Text } from "./styled";
import { PAGES } from "@/constants";

const LoginForm = () => {
  return (
    <ModGrid textAlign='center' verticalAlign='middle'>
      <ModGridColumn >
        <Header as='h3' textAlign='center'>
          <div>
            <Image
              src="/Callixto.png"
              alt="Callixto.png Logo"
              width={300}
              height={100}
              priority
            />
            <Text>Ingresa a tu cuenta</Text>
          </div>
        </Header>
        <Form size='large'>
          <Segment stacked>
            <Form.Input fluid icon='user' iconPosition='left' placeholder='Correo electrónico' />
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Contraseña'
              type='password'
            />
            <ModButton2 fluid size='large'>
              Ingresar
            </ModButton2>
          </Segment>
        </Form>
        <Message>
          <Link href={PAGES.PRODUCTS.BASE}> Perdiste tu contraseña?</Link>
        </Message>
      </ModGridColumn>
    </ModGrid>
  )
};

export default LoginForm;