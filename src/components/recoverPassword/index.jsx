"use client";
import { confirmReset, recoverPassword } from "@/api/login";
import { ICONS, PAGES, PASSWORD_REQUIREMENTS, RULES } from "@/common/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import PasswordInput from "../common/form/Password/PasswordField";
import { ModButton, ModGrid, ModGridColumn, ModHeader, RedirectLink, Text } from "./styles";
import { PasswordControlled, PasswordRequirements, TextControlled } from "../common/form";

const RecoverPasswordForm = () => {
  const { push } = useRouter();
  const methods = useForm();
  const { handleSubmit, control, reset, watch } = methods;
  const [isCodeSent, setIsCodeSent] = useState(false);

  const newPassword = watch("newPassword", "");

  useEffect(() => {
    if (!isCodeSent) {
      reset({
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isCodeSent, reset]);

  const { mutate: onRecoverPassword, isPending: isRecoverPasswordPending } = useMutation({
    mutationFn: async (emailData) => {
      const data = await recoverPassword(emailData);
      return data;
    },
    onSuccess: (_, emailData) => {
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico.");
      setIsCodeSent(true);
      reset({
        username: emailData.username,
      });
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

  return (
    <ModGrid>
      <ModGridColumn>
        <ModHeader as="h3">
          <Text>{isCodeSent ? "Cambiar Contraseña" : "Recuperar Contraseña"}</Text>
        </ModHeader>
        <FormProvider {...methods}>
          <Form
            onSubmit={handleSubmit((data) => {
              isCodeSent ? onConfirmReset(data) : onRecoverPassword(data);
            })}
            size="large"
          >
            {!isCodeSent ? (
              <TextControlled
                name="username"
                rules={{
                  ...RULES.REQUIRED,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "El correo electrónico no es válido",
                  },
                }}
                placeholder="Correo electrónico"
                icon={ICONS.USER}
                iconPosition="left"
              />
            ) : (
              <>
                <TextControlled
                  name="confirmationCode"
                  rules={RULES.REQUIRED}
                  placeholder="Código de recuperación"
                  icon={ICONS.MAIL_SQUARE}
                  iconPosition="left"
                />
                <PasswordControlled
                  name="newPassword"
                  rules={{
                    ...RULES.REQUIRED,
                    validate: (value) => {
                      const failedRequirements = PASSWORD_REQUIREMENTS.filter(
                        (req) => !req.test.test(value)
                      );
                      return (
                        failedRequirements.length === 0 ||
                        "La contraseña no cumple con los requisitos."
                      );
                    },
                  }}
                  placeholder="Nuevo Contraseña"
                  showPasswordRequirements
                />
                <PasswordControlled
                  name="confirmPassword"
                  placeholder="Confirmar Nueva Contraseña"
                  rules={{
                    ...RULES.REQUIRED,
                    validate: (value) =>
                      value === newPassword || "Las contraseñas no coinciden",
                  }}
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
            <RedirectLink onClick={() => push(PAGES.LOGIN.BASE)}>
              Volver al inicio de sesión
            </RedirectLink>
          </Form>
        </FormProvider>
      </ModGridColumn>
    </ModGrid>
  );
};

export default RecoverPasswordForm;
