"use client";
import { useUserContext } from "@/User";
import { getUserData } from "@/api/userData";
import { Loader } from "@/components/layout";
import { ICONS, PAGES, RULES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { ModButton, ModGrid, ModGridColumn, ModHeader, Text } from "./styled";

const LoginForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { setUserData } = useUserContext();

  const { mutate } = useMutation({
    mutationFn: async (dataLogin) => {
      setIsLoading(true);
      await onSubmit(dataLogin);
      const data = await getUserData();
      return data;
    },
    onSuccess: (userData) => {
      if (userData) {
        setUserData(userData);
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error("Los datos ingresados no son correctos!");
        setIsLoading(false);
      }
    },
    onError: (error) => {
      toast.error("Hubo un error al intentar ingresar. Por favor, intenta de nuevo.");
      console.error(error);
      setIsLoading(false);
    },
  });

  return (
    <Loader active={isLoading}>
      <ModGrid>
        <ModGridColumn>
          <ModHeader as="h3">
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
          <Form onSubmit={handleSubmit(mutate)} size="large">
            <Controller
              name="username"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <Form.Input
                  {...field}
                  placeholder="Correo electrónico"
                  fluid
                  icon={ICONS.USER}
                  iconPosition="left"
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <Form.Input
                  {...field}
                  type="password"
                  placeholder="Contraseña"
                  fluid
                  icon={ICONS.LOCK}
                  iconPosition="left"
                />
              )}
            />
            <ModButton fluid="true" size="large">
              Ingresar
            </ModButton>
          </Form>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
