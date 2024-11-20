"use client";
import { useUserContext } from "@/User";
import { Loader } from "@/components/layout";
import { ICONS, PAGES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import PasswordInput from "../common/custom/PasswordInput";
import { ModButton, ModGrid, ModGridColumn, ModHeader, PasswordLink, Text } from "./styles";

const LoginForm = ({ onSubmit }) => {
  const { setUserData } = useUserContext();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, control } = useForm();

  const { mutate: login } = useMutation({
    mutationFn: async (dataLogin) => {
      setIsLoading(true);
      const data = await onSubmit(dataLogin);
      return data;
    },
    onSuccess: (userData) => {
      if (userData) {
        setUserData(userData);
        toast.success("Ingreso exitoso!");
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error("Los datos ingresados no son correctos!");
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Hubo un error al intentar ingresar, por favor intenta de nuevo.");
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
          <Form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(login)();
              }
            }}
            onSubmit={handleSubmit(login)}
            size="large"
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: "El correo electrónico es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "El correo electrónico no es válido",
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <Form.Input
                  {...field}
                  placeholder="Correo electrónico"
                  fluid
                  icon={ICONS.USER}
                  iconPosition="left"
                  error={
                    error
                      ? { content: error.message, pointing: "below" }
                      : false
                  }
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: "La contraseña es obligatoria",
              }}
              render={({ field, fieldState: { error } }) => (
                <PasswordInput
                  field={field}
                  placeholder="Contraseña"
                  error={error?.message}
                />
              )}
            />
            <ModButton fluid="true" size="large">
              Ingresar
            </ModButton>
            <PasswordLink onClick={() => push(PAGES.RECOVER_PASSWORD.BASE)}>
              ¿Olvidaste tu contraseña?
            </PasswordLink>
          </Form>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
