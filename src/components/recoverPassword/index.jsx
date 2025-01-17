"use client";
import { recoverPassword } from "@/api/login";
import { Loader } from "@/components/layout";
import { ICONS, PAGES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { ModButton, ModGrid, ModGridColumn, ModHeader, PasswordLink, Text } from "./styles";

const RecoverPasswordForm = () => {
  const { push } = useRouter();
  const { handleSubmit, control, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: onRecoverPassword } = useMutation({
    mutationFn: async (emailData) => {
      setIsLoading(true);
      const data = await recoverPassword(emailData);
      console.log(emailData)
      return data;
    },
    onSuccess: () => {
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico.");
      setIsLoading(false);
      reset();
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
            <Text>Recuperar Contraseña</Text>
          </ModHeader>
          <Form onSubmit={handleSubmit(onRecoverPassword)} size="large">
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
            <ModButton fluid="true" size="large">
              Enviar
            </ModButton>
            <PasswordLink onClick={() => push(PAGES.LOGIN.BASE)}>
              Volver al inicio de sesión
            </PasswordLink>
          </Form>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default RecoverPasswordForm;