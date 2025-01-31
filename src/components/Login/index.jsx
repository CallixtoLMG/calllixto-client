"use client";
import { useUserContext } from "@/User";
import { getUserData } from "@/api/userData";
import { Loader } from "@/components/layout";
import { ICONS, PAGES, RULES } from "@/common/constants";
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
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { handleSubmit, control, reset } = useForm();

  const handleScreenChange = (isResetScreen) => {
    setShowPasswordReset(isResetScreen);
    reset({ email: "", password: "" });
  };

  const { mutate: login } = useMutation({
    mutationFn: async (dataLogin) => {
      setIsLoading(true);
      await onSubmit(dataLogin);
      const data = await getUserData();
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

  const { mutate: recoverPassword } = useMutation({
    mutationFn: async (emailData) => {
      setIsLoading(true);
      const data = await onPasswordReset(emailData);
      return data;
    },
    onSuccess: () => {
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico.");
      setIsLoading(false);
      handleScreenChange(false);
    },
    onError: () => {
      toast.error("Hubo un error al enviar el enlace de recuperación.");
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
          {showPasswordReset ? (
            <Form onSubmit={handleSubmit(recoverPassword)} size="large">
              <Controller
                name="username"
                control={control}
                rules={{
                  required: "El correo electrónico es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "El correo electrónico no es válido",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Form.Input
                      {...field}
                      placeholder="Correo electrónico"
                      fluid
                      icon={ICONS.USER}
                      iconPosition="left"
                      error={!!error}
                    />
                    {error && (
                      <Text style={{ color: "red", marginTop: "5px" }}>
                        {error.message}
                      </Text>
                    )}
                  </>
                )}
              />
              <ModButton fluid="true" size="large">
                Enviar
              </ModButton>
              <PasswordLink onClick={() => handleScreenChange(false)}>
                Volver al inicio de sesión
              </PasswordLink>
            </Form>
          ) : (
            <Form onSubmit={handleSubmit(login)} size="large">
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
              <PasswordLink onClick={() => push(PAGES.RESTORE_PASSWORD.BASE)}>
                ¿Olvidaste tu contraseña?
              </PasswordLink>
            </Form>
          )}
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
