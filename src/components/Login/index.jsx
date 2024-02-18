"use client";
import { useUserContext } from "@/User";
import { Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { ModButton, ModGrid, ModGridColumn, ModHeader, ModMessage, Text } from "./styled";

const LoginForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control } = useForm();
  const { setUserData } = useUserContext();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (dataLogin) => {
      const data = await onSubmit(dataLogin);
      return data;
    },
    onSuccess: (userData) => {
      if (userData) {
        setUserData(userData);
        push(PAGES.PRODUCTS.BASE);
        toast.success("Ingreso exitoso!");
      } else {
        toast.error("Los datos ingresados no Los datos ingresados no son correctos!");
      }
    },
    onSettled: () => {
      isSuccess(true);
    }
  });

  return (
    <Loader active={isPending || isSuccess}>
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
          <Form onSubmit={handleSubmit(mutate)} size='large'>
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
