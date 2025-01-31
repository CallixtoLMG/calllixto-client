import { confirmReset, recoverPassword } from "@/api/login";
import { getUserData } from "@/api/userData";
import { GoBackButton } from "@/components/common/buttons";
import { Loader } from "@/components/layout";
import { COLORS, ICONS, PAGES, PASSWORD_REQUIREMENTS, RULES } from "@/common/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form } from "semantic-ui-react";
import { Flex, FlexColumn, Label, Message } from "../common/custom";
import PasswordInput from "../common/form/Password/PasswordField";
import { ModGrid, ModGridColumn, ModHeader } from "./styled";
import { PasswordControlled, PasswordRequirements, TextControlled } from "../common/form";

const ChangePasswordForm = () => {
  const { push } = useRouter();
  const methods = useForm();
  const { handleSubmit, watch, reset } = methods;
  const [email, setEmail] = useState("");
  const [isCodeRequested, setIsCodeRequested] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const sessionData = await getUserData();
      if (sessionData) {
        setEmail(sessionData.username);
      }
    };

    getData();
  }, []);

  const resetInputs = useCallback(() => {
    reset({
      confirmationCode: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [reset]);

  useEffect(() => {
    if (!isCodeRequested) {
      resetInputs();
    }
  }, [isCodeRequested, resetInputs]);

  const { mutate: requestCode, isPending: isRequestCodePending } = useMutation({
    mutationFn: async () => {
      const data = await recoverPassword({ username: email });
      return data;
    },
    onSuccess: () => {
      toast.success("Código de validación enviado a tu correo.");
      setIsCodeRequested(true);
    },
    onError: () => {
      toast.error("Hubo un error al solicitar el código de validación.");
    },
  });

  const { mutate: onConfirmReset, isPending: isOnConfirmResetPending } = useMutation({
    mutationFn: async (passwordData) => {
      const { confirmPassword, ...dataToSend } = passwordData;
      const data = await confirmReset(dataToSend);
      return data;
    },
    onSuccess: () => {
      toast.success("Contraseña cambiada con éxito.");
      resetInputs();
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

  const newPassword = watch("newPassword");

  const handleConfirmReset = (data) => {
    const payload = {
      ...data,
      username: email,
    };
    onConfirmReset(payload);
  };

  return (
    <Loader active={false}>
      <ModGrid>
        <ModGridColumn>
          <ModHeader as="h3">
            <Label content="Cambiar contraseña" />
          </ModHeader>
          <Flex justifyContent="center" marginBottom="14px">
            <Button
              fluid
              type="button"
              color="blue"
              loading={isRequestCodePending}
              disabled={isRequestCodePending}
              onClick={() => requestCode()}
            >
              Solicitar código de validación
            </Button>
          </Flex>
          <Flex justifyContent="center" marginBottom="14px">
            <Message style={{ color: "gray", textAlign: "center" }}>
              Al solicitar el código, recibirás un enlace en tu correo para validar el cambio de contraseña.
            </Message>
          </Flex>
          <FormProvider {...methods}>
            <Form onSubmit={handleSubmit(handleConfirmReset)}>
              <TextControlled
                name="confirmationCode"
                placeholder="Código de recuperación"
                icon={ICONS.MAIL_SQUARE}
                iconPosition="left"
                disabled={!isCodeRequested}
                rules={RULES.REQUIRED}
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
              <FlexColumn rowGap="14px">
                <Button
                  loading={isOnConfirmResetPending}
                  disabled={isOnConfirmResetPending || isRequestCodePending || !isCodeRequested}
                  fluid
                  color={COLORS.GREEN}
                >
                  Confirmar
                </Button>
                <Flex justifyContent="center">
                  <GoBackButton />
                </Flex>
              </FlexColumn>
            </Form>
          </FormProvider>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default ChangePasswordForm;
