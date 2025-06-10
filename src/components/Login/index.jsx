"use client";
import { useUserContext } from "@/User";
import { getUserData } from "@/api/userData";
import { ICONS, PAGES, RULES } from "@/common/constants";
import { Loader } from "@/components/layout";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "../../common/components/custom";
import { PasswordControlled, TextControlled } from "../../common/components/form";
import { ModButton, ModGrid, ModGridColumn, ModHeader, PasswordLink, Text } from "./styles";

const LoginForm = ({ onSubmit }) => {
  const { setUserData } = useUserContext();
  const { push } = useRouter();
  const methods = useForm();
  const { handleSubmit } = methods;

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (dataLogin) => {
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
      }
    },
    onError: () => {
      toast.error("Hubo un error al intentar ingresar, por favor intenta de nuevo.");
    },
  });

  return (
    <Loader active={isPending}>
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
          <FormProvider {...methods}>
            <Form onSubmit={handleSubmit(login)} size="large">
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
              <ModButton $fluid size="large">
                Ingresar
              </ModButton>
              <PasswordLink onClick={() => push(PAGES.RESTORE_PASSWORD.BASE)}>
                ¿Olvidaste tu contraseña?
              </PasswordLink>
            </Form>
          </FormProvider>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default LoginForm;
