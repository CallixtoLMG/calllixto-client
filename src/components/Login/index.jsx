"use client";
import { PAGES } from "@/constants";
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Controller, useForm } from "react-hook-form";
import { Form, Segment } from 'semantic-ui-react';
import { ModButton, ModGrid, ModGridColumn, ModHeader, ModMessage, Text } from "./styled";

const LoginForm = ({ onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control } = useForm();
  const handleForm = async (data) => {
    const loginSuccess = await onSubmit(data);
    if (loginSuccess) {
      router.push(PAGES.PRODUCTS.BASE);
    };
  };

  return (
    <ModGrid>
      <ModGridColumn >
        <ModHeader as='h3' >
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
        </ModHeader>
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
            <ModButton fluid="true" size='large'>
              Ingresar
            </ModButton>
          </Segment>
        </Form>
        <ModMessage>
          <Link href={PAGES.PRODUCTS.BASE}> Perdiste tu contraseña?</Link>
        </ModMessage>
      </ModGridColumn>
    </ModGrid>
  )
};

export default LoginForm;