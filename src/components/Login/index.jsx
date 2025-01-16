"use client";
import { getUserData } from "@/api/userData";
import { Loader } from "@/components/layout";
import { ICONS, PAGES, RULES } from "@/constants";
import { useUserContext } from "@/User";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { ModButton, ModGrid, ModGridColumn, ModHeader, PasswordLink, Text } from "./styled";

const LoginForm = ({ onSubmit, onPasswordReset }) => {
  const { setUserData } = useUserContext();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
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
    onError: (error) => {
      toast.error("Hubo un error al intentar ingresar. Por favor, intenta de nuevo.");
      console.error(error);
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
              <Text>
                {showPasswordReset
                  ? "Para recuperar su contraseña ingrese su email"
                  : "Ingresa a tu cuenta"}
              </Text>
            </div>
          </ModHeader>
          {showPasswordReset ? (
            <Form onSubmit={handleSubmit(recoverPassword)} size="large">
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
                name="email"
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
                    type={showPassword ? "text" : "password"} 
                    placeholder="Contraseña"
                    fluid
                    icon={ICONS.LOCK} 
                    iconPosition="left"
                    action={{
                      icon: showPassword ? ICONS.EYE_SLASH : ICONS.EYE,
                      onClick: () => setShowPassword(!showPassword), 
                      title: showPassword ? "Ocultar contraseña" : "Mostrar contraseña",
                    }}
                  />
                )}
              />
              <ModButton fluid="true" size="large">
                Ingresar
              </ModButton>
              <PasswordLink onClick={() => handleScreenChange(true)}>
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
