"use client";
import { getUserData } from "@/api/userData";
import { Button } from "@/common/components/custom";
import { COLORS, ICONS, PAGES, RULES, SIZES } from "@/common/constants";
import AuthLayout, { AuthSecondaryLink } from "@/components/auth/AuthLayout";
import { Loader } from "@/components/layout";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "../../common/components/custom";
import { PasswordControlled, TextControlled } from "../../common/components/form";

const LoginForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const methods = useForm();
  const { handleSubmit } = methods;
  const [isMounted, setIsMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (dataLogin) => {
      const loginResult = await onSubmit(dataLogin);
      if (loginResult?.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        return loginResult;
      }

      const data = await getUserData();
      return { userData: data };
    },
    onSuccess: (result) => {
      if (result?.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setIsRedirecting(true);
        toast.success("Código correcto! Ahora debes cambiar tu contrasena para completar el ingreso.");
        push(`${PAGES.RESTORE_PASSWORD.BASE}?primerIngreso=true`);
        return;
      }

      const userData = result?.userData;
      if (userData) {
        setIsRedirecting(true);
        toast.success("Ingreso exitoso!");
        push(PAGES.BUDGETS.BASE);
      } else {
        toast.error("Los datos ingresados no son correctos!");
      }
    },
    onError: () => {
      toast.error("Hubo un error al intentar ingresar, por favor intenta de nuevo.");
    },
  });

  return (
    <Loader active={isPending || isRedirecting}>
      <AuthLayout title="Iniciar sesión">
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(login)} size={SIZES.LARGE}>
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
            <PasswordControlled
              name="password"
              rules={RULES.REQUIRED}
              placeholder="Contraseña"
            />
            <Button
              color={COLORS.BLUE}
              width="100%"
              height="42px"
              $fontSize="15px"
              padding="0 18px"
              type="submit"
              disabled={!isMounted || isPending || isRedirecting}
            >
              Ingresar
            </Button>
            <AuthSecondaryLink onClick={() => push(PAGES.RESTORE_PASSWORD.BASE)}>
              ¿Olvidaste tu contraseña?
            </AuthSecondaryLink>
          </Form>
        </FormProvider>
      </AuthLayout>
    </Loader>
  );
};

export default LoginForm;
