"use client";
import { PAGES } from "@/constants";
import Loader from "../layout/Loader";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Form, Header, Message, Segment } from "semantic-ui-react";
import { ModButton, ModGrid, ModGridColumn, Text } from "./styled";
import { useState } from "react";

const LoginForm = ({ onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const handleForm = async (data) => {
    setIsLoading(true);
    const loginSuccess = await onSubmit(data);
    onSubmit(data);
    if (loginSuccess) {
      router.push(PAGES.PRODUCTS.BASE);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Loader active={isLoading}>
      <ModGrid textAlign="center" verticalAlign="middle">
        <ModGridColumn>
          <Header as="h3" textAlign="center">
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
          <Form onSubmit={handleSubmit(handleForm)} size="large">
            <Segment stacked>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    placeholder="Correo electrónico"
                    fluid
                    icon="user"
                    iconPosition="left"
                    {...field}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    type="password"
                    placeholder="Contraseña"
                    fluid
                    icon="lock"
                    iconPosition="left"
                    {...field}
                  />
                )}
              />
              <ModButton fluid="true" size="large">
                Ingresar
              </ModButton>
            </Segment>
          </Form>
          <Message>
            <Link href={PAGES.PRODUCTS.BASE}>Perdiste tu contraseña?</Link>
          </Message>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
