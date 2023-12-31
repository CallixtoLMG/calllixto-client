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
import { Segment } from "@/components/common/custom";

const LoginForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const recovery = false;
  const { handleSubmit, control } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const handleForm = async (data) => {
    setIsLoading(true);
    const loginSuccess = await onSubmit(data);
    if (loginSuccess) {
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
            <Segment stacked>
              <Controller
                name="email"
                control={control}
                render={({ field }) =>
                (<Form.Input
                  placeholder='Correo electrónico'
                  fluid
                  icon='user'
                  iconPosition='left'
                  {...field}
                />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    type='password'
                    placeholder='Contraseña'
                    fluid
                    icon='lock'
                    iconPosition='left'
                    {...field}
                  />
                )}
              />
              <ModButton fluid="true" size='large'>
                Ingresar
              </ModButton>
            </Segment>
          </Form>
          {recovery &&
            <ModMessage>
              <Link href={PAGES.PRODUCTS.BASE}> Perdiste tu contraseña?</Link>
            </ModMessage>}
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
