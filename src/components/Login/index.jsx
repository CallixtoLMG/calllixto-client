"use client";
import { PAGES } from "@/constants";
import Image from 'next/image';
import Link from 'next/link';
import { Controller, useForm } from "react-hook-form";
import { Form, Header, Message, Segment } from 'semantic-ui-react';
import { ModButton2, ModGrid, ModGridColumn, Text } from "./styled";

const LoginForm = ({ onSubmit }) => {

  const { handleSubmit, control } = useForm();

  const handleForm = (data) => {
    onSubmit(data)
  };

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
        <Form onSubmit={handleSubmit(handleForm)} size='large'>
          <Segment stacked>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Form.Input placeholder='Correo electrónico' fluid icon='user' iconPosition='left' {...field} />}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Form.Input type='password' placeholder='Contraseña' fluid icon='lock' iconPosition='left' {...field} />}
            />
            <ModButton2 fluid="true" size='large'>
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