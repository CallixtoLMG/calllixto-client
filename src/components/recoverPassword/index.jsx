"use client";
import { confirmReset, recoverPassword } from "@/api/login";
import { ICONS, PAGES, RULES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import PasswordInput from "../common/custom/PasswordInput";
import { ModButton, ModGrid, ModGridColumn, ModHeader, PasswordLink, Text } from "./styles";

const RecoverPasswordForm = () => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, watch } = useForm();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [email, setEmail] = useState("");

  const { mutate: onRecoverPassword, isPending: isRecoverPasswordPending } = useMutation({
    mutationFn: async (emailData) => {
      const data = await recoverPassword(emailData);
      return data;
    },
    onSuccess: (_, emailData) => {
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico.");
      setIsCodeSent(true);
      setEmail(emailData.username);
      reset();
    },
    onError: () => {
      toast.error("Hubo un error al enviar el enlace de recuperación.");
    },
  });

  const { mutate: onConfirmReset, isPending: isConfirmResetPending } = useMutation({
    mutationFn: async (passwordData) => {
      const { confirmPassword, ...dataToSend } = passwordData;
      const data = await confirmReset(dataToSend);
      return data;
    },
    onSuccess: () => {
      toast.success("Contraseña cambiada con éxito.");
      push(PAGES.LOGIN.BASE);
    },
    onError: () => {
      toast.error("Hubo un error al cambiar la contraseña.");
    },
  });

  const newPassword = watch("newPassword");

  const handleConfirmReset = (data) => {
    const payload = {
      ...data,
      username: email,
    };
    onConfirmReset(payload);
  };

  return (
    <ModGrid>
      <ModGridColumn>
        <ModHeader as="h3">
          <Text>{isCodeSent ? "Cambiar Contraseña" : "Recuperar Contraseña"}</Text>
        </ModHeader>
        <Form onSubmit={handleSubmit(isCodeSent ? handleConfirmReset : onRecoverPassword)} size="large">
          {!isCodeSent ? (
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
          ) : (
            <>
              <Controller
                name="confirmationCode"
                control={control}
                rules={{ required: "El código es obligatorio" }}
                render={({ field, fieldState: { error } }) => (
                  <Form.Input
                    {...field}
                    placeholder="Código de recuperación"
                    fluid
                    icon={ICONS.MAIL_SQUARE}
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
                name="newPassword"
                control={control}
                rules={{
                  required: "La nueva contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <PasswordInput
                    field={field}
                    placeholder="Nueva contraseña"
                    error={error}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  ...RULES.REQUIRED,
                  validate: (value) =>
                    value === newPassword || "Las contraseñas no coinciden",
                }}
                render={({ field, fieldState: { error } }) => (
                  <PasswordInput
                    field={field}
                    placeholder="Confirmar nueva contraseña"
                    error={error}
                  />
                )}
              />
            </>
          )}
          <ModButton
            loading={isCodeSent ? isConfirmResetPending : isRecoverPasswordPending}
            fluid="true"
            size="large"
          >
            {isCodeSent ? "Cambiar Contraseña" : "Enviar"}
          </ModButton>
          <PasswordLink onClick={() => push(PAGES.LOGIN.BASE)}>
            Volver al inicio de sesión
          </PasswordLink>
        </Form>
      </ModGridColumn>
    </ModGrid>
  );
};

export default RecoverPasswordForm;
