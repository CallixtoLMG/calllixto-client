"use client";
import { PAGES } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { Loader } from "@/components/layout";
import { ModButton, ModGrid, ModGridColumn, ModHeader, ModMessage, Text } from "./styled";
import { useUserContext } from "@/User";

const LoginForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { setUserData } = useUserContext();
  const handleForm = async (data) => {
    setIsLoading(true);
    const userData = await onSubmit(data);
    if (userData) {
      setUserData(userData);
      push(PAGES.PRODUCTS.BASE);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Loader active={isLoading}>
      <ModGrid >
        <ModGridColumn >
          <ModHeader as='h3'>
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
            <Controller
              name="email"
              control={control}
              render={({ field }) =>
              (<Form.Input
                {...field}
                placeholder='Correo electrónico'
                fluid
                icon='user'
                iconPosition='left'
              />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Form.Input
                  {...field}
                  type='password'
                  placeholder='Contraseña'
                  fluid
                  icon='lock'
                  iconPosition='left'
                />
              )}
            />
            <ModButton fluid="true" size='large'>
              Ingresar
            </ModButton>
          </Form>
          {false &&
            <ModMessage>
              <Link href={PAGES.PRODUCTS.BASE}>Perdiste tu contraseña?</Link>
            </ModMessage>}
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
