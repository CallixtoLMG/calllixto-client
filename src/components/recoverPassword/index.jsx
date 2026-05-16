"use client";
import { useUserContext } from "@/User";
import { confirmNewPasswordRequired, confirmReset, recoverPassword } from "@/api/login";
import { getUserData } from "@/api/userData";
import { Form } from "@/common/components/custom";
import { PasswordControlled, TextControlled } from "@/common/components/form";
import { ICONS, PAGES, PASSWORD_REQUIREMENTS, RULES, SIZES } from "@/common/constants";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ModButton, ModGrid, ModGridColumn, ModHeader, RedirectLink, Text } from "./styles";

const RecoverPasswordForm = ({ isFirstLogin = false }) => {
  const { push } = useRouter();
  const { setUserData } = useUserContext();
  const methods = useForm();
  const { handleSubmit, reset, watch } = methods;
  const [isCodeSent, setIsCodeSent] = useState(isFirstLogin);

  const newPassword = watch("newPassword", "");

  useEffect(() => {
    if (!isCodeSent && !isFirstLogin) {
      reset({
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isCodeSent, isFirstLogin, reset]);

  const { mutate: onRecoverPassword, isPending: isRecoverPasswordPending } = useMutation({
    mutationFn: recoverPassword,
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
    onError: (error) => {
      if (error.name.includes("LimitExceededException")) {
        toast.error("Se ha excedido el límite de intentos permitidos, por favor pruebe más tarde.");
      } else if (error.name.includes("CodeMismatchException")) {
        toast.error("Hubo un error en el código de validación.");
      } else {
        toast.error("Hubo un error al cambiar la contraseña.");
        console.error("Error:", error);
      }
    },
  });

  const { mutate: onConfirmFirstLogin, isPending: isConfirmFirstLoginPending } = useMutation({
    mutationFn: async (passwordData) => {
      const result = await confirmNewPasswordRequired({
        newPassword: passwordData.newPassword,
      });

      if (result.nextStep?.signInStep !== "DONE") {
        throw new Error("El cambio de contrasena no completo el ingreso.");
      }

      const data = await getUserData();
      return data;
    },
    onSuccess: (userData) => {
      if (userData) {
        setUserData(userData);
        toast.success("Contrasena cambiada con exito.");
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error("No se pudieron obtener los datos del usuario.");
      }
    },
    onError: (error) => {
      if (error.name?.includes("InvalidPasswordException")) {
        toast.error("La contrasena no cumple con los requisitos.");
      } else {
        toast.error("Hubo un error al cambiar la contrasena.");
        console.error("Error:", error);
      }
    },
  });

  const isChangingPassword = isCodeSent || isFirstLogin;
  const isSubmitPending = isFirstLogin
    ? isConfirmFirstLoginPending
    : isCodeSent
      ? isConfirmResetPending
      : isRecoverPasswordPending;

  return (
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
            <Text>{isCodeSent ? "Cambiar contraseña" : "Recuperar contraseña"}</Text>
          </div>
        </ModHeader>
        <FormProvider {...methods}>
          <Form
            onSubmit={handleSubmit((data) => {
              if (isFirstLogin) {
                onConfirmFirstLogin(data);
              } else {
                isCodeSent ? onConfirmReset(data) : onRecoverPassword(data);
              }
            })}
            size={SIZES.LARGE}
          >
            {!isChangingPassword ? (
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
                {!isFirstLogin && (
                  <TextControlled
                    name="confirmationCode"
                    rules={RULES.REQUIRED}
                  placeholder="Código de recuperación"
                    icon={ICONS.MAIL_SQUARE}
                    iconPosition="left"
                  />
                )}
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
                  placeholder="Nuevo contraseña"
                  showPasswordRequirements
                />
                <PasswordControlled
                  name="confirmPassword"
                  placeholder="Confirmar nueva contraseña"
                  rules={{
                    ...RULES.REQUIRED,
                    validate: (value) =>
                      value === newPassword || "Las contraseñas no coinciden",
                  }}
                />
              </>
            )}
            <ModButton
              loading={isSubmitPending}
              fluid="true"
              size={SIZES.LARGE}
              disabled={isSubmitPending}
            >
              {isCodeSent ? "Cambiar contraseña" : "Enviar"}
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
